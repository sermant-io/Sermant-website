# The problem and analysis of class enhancement conflict when multiple JavaAgents are used at the same time

## Problem Background
JavaAgent technology is often used to intercept and modify bytecodes before loading class files to achieve non-intrusive enhancements to Java applications. Servant is an open source JavaAgent framework project dedicated to the field of service governance. A customer has integrated two sets of JavaAgents before integrating Sermant: self-developed JavaAgent for business capability enhancement and SkyWalking for link acquisition. When the client independently mounts the self-developed JavaAgent plug-in package, the bytecode enhancement can take effect as expected. Later, the open source SkyWalking was introduced and the self-developed JavaAgent plug-in package and SkyWalking were mounted to the business application through the `-javaagent` startup parameter. During use, it is found that the loading order of the two has a direct impact on whether the expected interception point enhancement takes effect or not. Why does this phenomenon occur? The client turned to the Sermant community to solve the enhanced conflict of multiple JavaAgents to avoid recurrence of similar typical problems and to integrate Sermant for business service governance smoothly.

Below, the author attempts to analyze the crux of the problem from the perspective of the underlying logic of bytecode enhancement.

## Enhanced conflict problem of mounting multiple JavaAgents
The original intention of introducing SkyWalking is to hope that the enhancement of the service by the self-developed JavaAgent and the link tracking capability of SkyWalking can take effect in service applications normally. The `-javaagent` parameter supports multiple executions, so add `-javaagent:/xxx/my-agent.jar` and `-javaagent:/xxx/skywalking-agent to `JAVA_TOOL_OPTIONS` when starting the application .jar` parameter.

### Load the self-developed JavaAgent first and then load SkyWalking

When testing, first put the self-developed JavaAgent in the front, and SkyWalking in the back, that is, `-javaagent:/xxx/my-agent.jar -javaagent:/xxx/SkyWalking-agent.jar`. The logic executed before the application starts is shown in the following figure. According to the configuration order of the parameters, the self-developed JavaAgent should first enhance the bytecode in the jar package of the business application, then enhance it by SkyWalking, and finally execute the `main()` method of the business application to start the application.

However, after startup, it is found that SkyWalking throws a `java.lang.UnsupportedOperationException` exception in the log, and the target class corresponding to this exception is `com.google.common.eventbus.Dispatcher$LegacyAsyncDispatcher`. The self-developed JavaAgent throws no exceptions.

<MyImage src="/docs-img/javaagent-skywalking-main.png"></MyImage>

```java
ERROR 2022-09-27 15:32:09:546 main SkyWalkingAgent : index=0, batch=[class com.google.common.eventbus.Dispatcher$LegacyAsyncDispatcher], types=[class com.google.common.eventbus.Dispatcher$LegacyAsyncDispatcher] 
Caused by: java.lang.UnsupportedOperationException: class redefinition failed: attempted to change superclass or interfaces
	at sun.instrument.InstrumentationImpl.retransformClasses0(Native Method)
	at sun.instrument.InstrumentationImpl.retransformClasses(InstrumentationImpl.java:144)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.apache.SkyWalking.apm.dependencies.net.bytebuddy.agent.builder.AgentBuilder$RedefinitionStrategy$Dispatcher$ForJava6CapableVm.retransformClasses(AgentBuilder.java:6910)
	... 12 more
```

After confirming that the self-developed JavaAgent has not intercepted and enhanced this class, the apm-guava-eventbus-plugin plugin in SkyWalking intercepted and enhanced this class. The two JavaAgents don't enhance the same class at the same time, but SkyWalking fails to enhance, which is a bit puzzling. Preliminary guesses may be related to the loading order of JavaAgent, the author adjusted the order and tested again.

### Load SkyWalking first and then load self-developed JavaAgent

After adjustment, `JAVA_TOOL_OPTIONS` is configured as `-javaagent:/xxx/SkyWalking-agent.jar -javaagent:/xxx/my-agent.jar`, and the logic executed before the application starts is shown in the following figure

<MyImage src="/docs-img/skywalking-javaagent-main.png"></MyImage>

After adjustment, it is found that the two JavaAgents have no error log, and the enhancement of each interception point can also take effect normally, without encountering the conflict of class enhancement.

The appearance of the problem gives the intuition that the load order of the JavaAgent does matter to the bytecode enhancement. But why does this happen?

## Conflict root cause analysis
### Enhance the role of failing classes in two JavaAgents
As mentioned above, SkyWalking fails to enhance `com.google.common.eventbus.Dispatcher$LegacyAsyncDispatcher` in the scenario where the self-developed JavaAgent is loaded first and then SkyWalking is loaded. `Dispatcher$LegacyAsyncDispatcher` This class is defined in the SkyWalking plugin as an interception-enhanced class.

After investigation, it was found that `Dispatcher$LegacyAsyncDispatcher` was also introduced as a third-party dependency in the self-developed JavaAgent during the enhancement process, but it was not enhanced.

### Debug analysis
In view of the fact that the self-developed JavaAgent did not report an error, but SkyWalking was abnormal, debug analysis of SkyWalking was carried out.

In the `premain` method, you can see that `com.google.common.eventbus.Dispatcher` has been loaded when entering the SkyWalkingAgent. By observing its class loader, you can know that the class is loaded during the startup process of the self-developed JavaAgent. Will it conflict if the loaded class is enhanced again? Then look down.

<MyImage src="/docs-img/skywalkingagent.png"></MyImage>

Analysis of the source code shows that SkyWalking uses the Byte Buddy bytecode enhancement tool, and `AgentBuilder` is used as the interface for providing bytecode enhancement. The following default `AgentBuilder$Default` is used in SkyWalking, and the `RedefinitionStrategy` stipulates How the loaded classes are modified by the constructed JavaAgent, and `RedefinitionStrategy.DiscoveryStrategy` specifies which classes are discovered for bytecode redefinition. The default strategy uses `RedefinitionStrategy.DiscoveryStrategy.SinglePass`

```java
/**
 * Creates a new agent builder with default settings. By default, Byte Buddy ignores any types loaded by the bootstrap class 	loader, any
 * type within a {@code net.bytebuddy} package and any synthetic type. Self-injection and rebasing is enabled. In order to 		avoid class format
 * changes, set {@link AgentBuilder#disableClassFormatChanges()}. All types are parsed without their debugging information
 * ({@link PoolStrategy.Default#FAST}).
 *
 * @param byteBuddy The Byte Buddy instance to be used.
 */ 
public Default(ByteBuddy byteBuddy) {
            this(byteBuddy,
                    Listener.NoOp.INSTANCE,
                    DEFAULT_LOCK,
                    PoolStrategy.Default.FAST,
                    TypeStrategy.Default.REBASE,
                    LocationStrategy.ForClassLoader.STRONG,
                    NativeMethodStrategy.Disabled.INSTANCE,
                    WarmupStrategy.NoOp.INSTANCE,
                    TransformerDecorator.NoOp.INSTANCE,
                    new InitializationStrategy.SelfInjection.Split(),
                    RedefinitionStrategy.DISABLED,
                    RedefinitionStrategy.DiscoveryStrategy.SinglePass.INSTANCE,
                    RedefinitionStrategy.BatchAllocator.ForTotal.INSTANCE,
                    RedefinitionStrategy.Listener.NoOp.INSTANCE,
                    RedefinitionStrategy.ResubmissionStrategy.Disabled.INSTANCE,
                    InjectionStrategy.UsingReflection.INSTANCE,
                    LambdaInstrumentationStrategy.DISABLED,
                    DescriptionStrategy.Default.HYBRID,
                    FallbackStrategy.ByThrowableType.ofOptionalTypes(),
                    ClassFileBufferStrategy.Default.RETAINING,
                    InstallationListener.NoOp.INSTANCE,
                    new RawMatcher.Disjunction(
                            new RawMatcher.ForElementMatchers(any(), isBootstrapClassLoader().or(isExtensionClassLoader())),
                            new RawMatcher.ForElementMatchers(nameStartsWith("net.bytebuddy.")
                                    .and(not(ElementMatchers.nameStartsWith(NamingStrategy.BYTE_BUDDY_RENAME_PACKAGE + ".")))
                                    .or(nameStartsWith("sun.reflect.").or(nameStartsWith("jdk.internal.reflect.")))
                                    .<TypeDescription>or(isSynthetic()))),
                    Collections.<Transformation>emptyList());
        }
```
The `resolve()` method in the `RedefinitionStrategy.DiscoveryStrategy.SinglePass` source code returns `instrumentation.getAllLoadedClasses()`, that is, this method will return a collection of all classes currently loaded by the JVM. It can be seen that `AgentBuilder$Default` will filter all classes loaded in the JVM (including its inner classes). The above mentioned `com.google.common.eventbus.Dispatcher` and its inner classes are in it. `RedefinitionStrategy` as the strategy of bytecode redefine will act on the `retransform` process of bytecode enhancement.

```java
/**
 * A strategy for discovering types to redefine.
 */
public interface DiscoveryStrategy {

    /**
     * Resolves an iterable of types to retransform. Types might be loaded during a previous retransformation which might require
     * multiple passes for a retransformation.
     *
     * @param instrumentation The instrumentation instance used for the redefinition.
     * @return An iterable of types to consider for retransformation.
     */
    Iterable<Iterable<Class<?>>> resolve(Instrumentation instrumentation);

    /**
     * A discovery strategy that considers all loaded types supplied by {@link Instrumentation#getAllLoadedClasses()}.
     */
    enum SinglePass implements DiscoveryStrategy {

        /**
         * The singleton instance.
         */
        INSTANCE;

        /**
         * {@inheritDoc}
         */
        public Iterable<Iterable<Class<?>>> resolve(Instrumentation instrumentation) {
            return Collections.<Iterable<Class<?>>>singleton(Arrays.<Class<?>>asList(instrumentation.getAllLoadedClasses()));
        }
    }
```

In `AgentBuilder`, the `retransform` process proceeds as shown below. First of all, `AgentBuilder` will filter all the classes currently loaded in the JVM according to the redefinition strategy during the construction process. When `Dispatcher#retransformClasses()` is executed, the classes loaded by the JVM and the SkyWalking declarations have been filtered out. The intersection of enhanced classes will eventually be called to the underlying implementation logic of bytecode enhancement through reflection `Instrumentation#retransformClasses()`, and the final processing is completed through the native method `retransformClasses0()`.

<MyImage src="/docs-img/agent-builder-retransform-classes.png"></MyImage>

The conflicting class `com.google.common.eventbus.Dispatcher$LegacyAsyncDispatcher` described above is in the set of classes to be processed by `Instrumentation#retransformClasses()`.

<MyImage src="/docs-img/retransformclasses.png"></MyImage>

### Root cause inquiry
After analyzing this step, it can be initially seen that some restrictions of the `retransformClasses()` method cause the conflicting class to encounter the previous `java.lang.UnsupportedOperationException` exception thrown. Therefore, the implementation logic of `Instrumentation` is analyzed next.

### Transform
When using the `java.lang.instrument.Instrumentation` interface for bytecode enhancement operations, the methods we must use are:
```java
void addTransformer(ClassFileTransformer transformer, boolean canRetransform)
```

Through this method, we can add a `ClassFileTransFormer` to the class we want to operate. As the name suggests, it is a class file converter. Its official description is as follows:

> All future class definitions will be seen by the transformer, except definitions of classes upon which any registered transformer is dependent. The transformer is called when classes are loaded, when they are redefined. and if `canRetransform` is true, when they are retransformed.
> 
> Simply put, after the converter is registered for a class, every redefine and retransform of the class in the future will be checked by the converter and the operation of the converter will be executed.

As can be seen from the above description, the bytecode enhancement operation we want to do is to add a converter to the JVM and convert the class in the JVM to the result we want through the converter (Transform a class by transfomer.) The process is as follows :

<MyImage src="/docs-img/premain.png"></MyImage>

First, run the JavaAgent through the `premain` method. At this time, we can get the `Instrumentation` in the `premain` parameter. The second step is to register the implemented `ClassFileTransfomer` with the JVM through the `Instrumentation` interface. When the JVM loads the class At this time, `ClassFileTransfomer` will obtain the byte array of the class, transform it and return it to the JVM. After that, the performance of the class in the Java program is the result of the transformation.

### Retransform
The above is what `Instrumentation` does when the class is loaded, but if the class is loaded and you want to convert it again (applicable to multiple JavaAgent scenarios and running JavaAgent through `agentmain`), you need to Use the following methods provided by the `Instrumentation` interface:

```java
void retransformClasses(Class<?>... classes) throws UnmodifiableClassException
```

Its official description is as follows:

> This function facilitates the instrumentation of already loaded classes. When classes are initially loaded or when they are redefined, the initial class file bytes can be transformed with the ClassFileTransformer. This function reruns the transformation process (whether or not a transformation has previously occurred)
>
> This method will be used to instrument already loaded classes and re-apply transformers starting from the bytecode of the original class load, and every transformer registered with the JVM will be executed.

Through this method, we can `transform` the class that has been loaded. The process after executing this method is as follows, which is actually to re-trigger the `transform` method in `ClassFileTransformer`:

<MyImage src="/docs-img/transform.png"></MyImage>

It is worth noting that `reTransformClasses` is very powerful, but it also has a series of limitations. In the official document description, the limitations are as follows:

> The retransformation must not add, remove or rename fields or methods, change the signatures of methods, or change inheritance.
> 
> During the retransformation process, we cannot add, delete or rename **fields** and **methods**, change the signature of the method, and change the inheritance of the class.

### Bytecode Analysis
Could the limitation of the above `reTransformClasses` method be the root cause of the problem?

After decompiling the SkyWalking-enhanced bytecode file, the reason was revealed. After the class is enhanced by Skywalking, there are more `implements EnhancedInstance` in the inheritance relationship. This obviously changes the inheritance relationship of the class, which happens to be the restricted behavior clearly described in the official website interface documentation. It is precisely because of the implementation of this interface that the class conflict enhancement problem of multiple JavaAgents described at the beginning of this article fails.

This issue also has a related [issue](https://github.com/apache/skywalking/issues/9701) in the SkyWalking community, the community explained that `reTransformClasses() is indeed broken in order to reduce reflection calls during link tracing. `Restriction, an interface is added after the class is enhanced.

```java
final class Dispatcher$LegacyAsyncDispatcher extends Dispatcher implements EnhancedInstance {
    private final ConcurrentLinkedQueue<com.google.common.eventbus.Dispatcher.LegacyAsyncDispatcher.EventWithSubscriber> queue;
    private volatile Object _$EnhancedClassField_ws;

    private Dispatcher$LegacyAsyncDispatcher() {
        this.queue = Queues.newConcurrentLinkedQueue();
    }

    void dispatch(Object var1, Iterator<Subscriber> var2) {
        delegate$51c0bj0.intercept(this, new Object[]{var1, var2}, cachedValue$P524FzM0$7gcbrk1, new JKwtdbN5(this));
    }

    public void setSkyWalkingDynamicField(Object var1) {
        this._$EnhancedClassField_ws = var1;
    }

    public Object getSkyWalkingDynamicField() {
        return this._$EnhancedClassField_ws;
    }

    static {
        ClassLoader.getSystemClassLoader().loadClass("net.bytebuddy.dynamic.Nexus").getMethod("initialize", Class.class, Integer.TYPE).invoke((Object)null, Dispatcher$LegacyAsyncDispatcher.class, -1207479570);
        cachedValue$P524FzM0$7gcbrk1 = Dispatcher$LegacyAsyncDispatcher.class.getDeclaredMethod("dispatch", Object.class, Iterator.class);
    }
}
```

## Summarize
### Recommendations for Avoiding Multiple JavaAgent Enhancement Conflicts
Now JavaAgent technology is more and more favored by major manufacturers and open source communities, and many excellent JavaAgent frameworks have emerged. When developers or manufacturers use JavaAgent, they will inevitably encounter scenarios where multiple JavaAgents are mounted at the same time. If JavaAgent developers can achieve good compatibility with other similar frameworks, it will bring less trouble to users. After all, users may not be able to thoroughly understand the underlying principles of byte enhancement.

The above analysis has found the root cause of multiple JavaAgent class enhancement conflicts, so how to avoid such problems? Here are two general suggestions.

### Carefully arrange the mount order of JavaAgent
Earlier we mentioned that the loading order of SkyWalking and self-developed JavaAgent will have different results. When SkyWalking is enhanced, the inheritance relationship of classes is modified, but the self-developed JavaAgent does not. In this scenario, the relatively low-compatibility SkyWalking is placed in the front, and the relatively high-compatibility self-developed JavaAgent is placed in the back, which can temporarily avoid classes. Enhanced conflict problem.

### Strict adherence to bytecode enhancement usage requirements and restrictions
But if we need to use 3 or more JavaAgents, the above method is a temporary solution.

Whether it is Byte Buddy, Javassist or ASM, the underlying implementation is inseparable from the `Instrumentation` interface introduced after JDK1.5. Since the design concept of the official interface is that `reTransformClasses()` cannot add, delete or rename fields and methods, change the signature of methods, and change the inheritance relationship of classes when enhancing classes, then as a framework developer of JavaAgent, you should Do not make designs beyond the above limitations, otherwise it will easily lead to compatibility problems between JavaAgents. Not only this interface, but the developers of the JavaAgent framework also need to follow the design concepts of all bytecode-enhanced underlying interfaces. After all, there are rules and order.

### Sergeant's practice of avoiding class enhancement conflicts
First of all, Sermant strictly complies with the above-mentioned official restrictions on bytecode enhancement, and does not change the original inheritance relationship of the class or the signature of class methods, etc., and has not encountered many problems in use A problem that JavaAgent compatibility causes Sermant's bytecode enhancement to fail. You only need to mount the Sermant at the end, which can basically prevent the typical class-enhanced conflict above from happening.

Secondly, Sermant should not only protect its own enhancement from other JavaAgents, but also consider avoiding the impact of Sermant on other JavaAgents. Servant plans to lazy load the use of third-party dependencies in the `premain` method, placing it in the initial stage of the `main` method execution after all JavaAgent `premain` methods are executed. In this way, no matter what the loading order of Sermant is in multiple JavaAgent scenarios, it will not affect the running of any other JavaAgent, and truly does not conflict with any other JavaAgent.

At present, most JavaAgents on the market and in the community are positioned in the field of link tracking or application monitoring. Sermant's own positioning based on service governance is not a relationship of substitution with other mainstream JavaAgents, but a relationship of friendly coexistence. It may not be uncommon for users to mount multiple JavaAgents. Sermant's practice of avoiding JavaAgent class enhancement conflicts can not only ensure that customers' business services can use the current limiting and degrading, service registration, load balancing, and label routing provided by Sermant without interference , graceful online and offline, and dynamic configuration of these microservice governance capabilities, without interfering with the step-by-step work of other JavaAgents used by customers.
