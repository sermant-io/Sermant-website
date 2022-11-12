---
sidebar: auto
---

# 记一次多个JavaAgent同时使用的类增强冲突问题及分析

## 问题背景
JavaAgent技术常被用于加载class文件之前进行拦截并修改字节码，以实现对Java应用的无侵入式增强。Sermant是致力于服务治理领域的开源JavaAgent框架项目。某客户在集成Sermant之前已集成了两套JavaAgent：用于业务能力增强的自研JavaAgent和用于链路采集的SkyWalking。该客户单独挂载自研JavaAgent插件包时，字节码增强可以按照预期生效。后期引入开源SkyWalking并同时将自研JavaAgent插件包和SkyWalking通过`-javaagent`启动参数挂载至业务应用中。使用过程中发现，两者的加载顺序会对预期的拦截点增强生效与否有直接影响。为什么会产生这种现象？该客户求助Sermant社区寻求解决多个JavaAgent的增强冲突问题，以避免类似典型问题再次出现以及顺利集成Sermant用于业务的服务治理。

下文笔者尝试从字节码增强的底层逻辑的角度来分析该问题的症结。

## 挂载多个JavaAgent的增强冲突问题
引入SkyWalking的初衷，是希望自研JavaAgent对业务的增强和SkyWalking的链路追踪能力都能正常在业务应用上生效。`-javaagent`参数是支持多次执行的，所以因此在启动应用时在`JAVA_TOOL_OPTIONS`中加上了`-javaagent:/xxx/my-agent.jar`和`-javaagent:/xxx/skywalking-agent.jar`参数。

### 先加载自研JavaAgent后加载SkyWalking

在测试时首先把自研JavaAgent放在前面，SkyWalking放在后面, 即`-javaagent:/xxx/my-agent.jar -javaagent:/xxx/SkyWalking-agent.jar`。应用启动前执行的逻辑如下图所示。按照参数的配置顺序，应该是自研JavaAgent先对业务应用的jar包中字节码进行增强，然后再由SkyWalking进行增强，最后再执行业务应用的`main()`方法启动应用。

然而启动后发现日志中SkyWalking抛出`java.lang.UnsupportedOperationException`异常，该异常对应的目标类是`com.google.common.eventbus.Dispatcher$LegacyAsyncDispatcher`。自研JavaAgent无异常抛出。

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

经过确认自研JavaAgent并没有对这个类有过拦截和增强，而SkyWalking中的apm-guava-eventbus-plugin插件对该类进行了拦截和增强。两个JavaAgent并没有同时增强同一个类，但是SkyWalking却增强失败了，有点令人费解。初步猜测可能JavaAgent的加载顺序有关，笔者调整了顺序，再次进行了测试。

### 先加载SkyWalking后加载自研JavaAgent

调整后`JAVA_TOOL_OPTIONS`配置为`-javaagent:/xxx/SkyWalking-agent.jar -javaagent:/xxx/my-agent.jar`，应用启动前执行的逻辑如下图所示

<MyImage src="/docs-img/skywalking-javaagent-main.png"></MyImage>

经过调整后，发现两个JavaAgent都没有错误日志，而且各拦截点的增强也能正常生效，没有遇到类增强的冲突问题。

问题表象给人的直觉是JavaAgent的加载顺序确实对字节码增强有关系。但是为什么会出现这种现象呢？

## 冲突根因分析
### 增强失败的类在两个JavaAgent中的角色
上面提到，先加载自研JavaAgent后加载SkyWalking的场景中遇到SkyWalking对`com.google.common.eventbus.Dispatcher$LegacyAsyncDispatcher`增强失败。`Dispatcher$LegacyAsyncDispatcher`这个类在SkyWalking的插件中定义为被拦截增强的类。

经过排查发现`Dispatcher$LegacyAsyncDispatcher`也被自研JavaAgent中在增强过程中作为第三方依赖引入，但并未对其增强。

### Debug分析
鉴于自研JavaAgent没有报错，但SkyWalking出现异常，所以对SkyWalking进行debug分析。

在`premain`方法中，可以看到进入到SkyWalkingAgent时`com.google.common.eventbus.Dispatcher`已经被加载了。观察它的类加载器，可以知道该类是在自研JavaAgent启动过程中被加载的。是不是被加载过后的类再进行增强就会冲突呢？接着往下看。

<MyImage src="/docs-img/skywalkingagent.png"></MyImage>

分析源码可知SkyWalking使用的是Byte Buddy字节码增强工具，`AgentBuilder`作为其提供字节码增强的接口，SkyWalking中使用到的是如下的默认的`AgentBuilder$Default`，其中的`RedefinitionStrategy`规定了已加载的类如何被构建的JavaAgent修改字节码，`RedefinitionStrategy.DiscoveryStrategy`则规定了发现哪些类来进行字节码的重定义，该默认策略使用的是`RedefinitionStrategy.DiscoveryStrategy.SinglePass`

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
`RedefinitionStrategy.DiscoveryStrategy.SinglePass`源码中的`resolve()`方法返回的是`instrumentation.getAllLoadedClasses()`，也就是说，该方法将返回JVM当前加载的所有类的集合。由此可以看出，`AgentBuilder$Default`将会对所有在JVM中已加载的类进行筛选（也包括其内部类）。上文提到`com.google.common.eventbus.Dispatcher`和其内部类都在其中。`RedefinitionStrategy`作为字节码redefine的策略将作用于字节码增强的`retransform`过程。

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

在`AgentBuilder`中，`retransform`过程如下图进行。首先`AgentBuilder`在构建过程中会根据重定义策略来对JVM中当前已加载的所有类来进行筛选处理，执行到`Dispatcher#retransformClasses()`时已经筛选出JVM已加载的类和SkyWalking声明要增强的类的交集，最终将通过反射调用到字节码增强的底层实现逻辑`Instrumentation#retransformClasses()`，通过native方法`retransformClasses0()`来完成最后的处理。

<MyImage src="/docs-img/agent-builder-retransform-classes.png"></MyImage>

上文所述产生冲突的类`com.google.common.eventbus.Dispatcher$LegacyAsyncDispatcher`就在`Instrumentation#retransformClasses()`要处理的类的集合中。

<MyImage src="/docs-img/retransformclasses.png"></MyImage>

### 根因探究
分析到这一步，可以初步看出应该是`retransformClasses()`方法的某些限制造成冲突的类遇到前面的的`java.lang.UnsupportedOperationException`异常的抛出。因此接下来分析下`Instrumentation`的实现逻辑。

### transform
在使用`java.lang.instrument.Instrumentation`接口进行字节码增强操作时，我们必要使用的方法便是：
```java
void addTransformer(ClassFileTransformer transformer, boolean canRetransform)
```

通过此方法，我们可以为我们想要操作的类添加一个`ClassFileTransFormer`，顾名思义其为类文件转换器，其官方描述如下：

> All future class definitions will be seen by the transformer, except definitions of classes upon which any registered transformer is dependent. The transformer is called when classes are loaded, when they are redefined. and if `canRetransform` is true, when they are retransformed.
> 
> 简单来讲，在对一个类注册了该转换器后，未来该类的每一次redefine以及retransform，都会被该转换器检查到，并且执行该转换器的操作。

由上述描述可以知道，我们想要做的字节码增强操作就是通过向JVM中添加转换器并且通过转换器将JVM中的类转换为我们想要的结果（Transform a class by transfomer.）流程如下：

<MyImage src="/docs-img/premain.png"></MyImage>

首先通过`premain`方法运行JavaAgent，此时在`premain`参数中我们可以获取到`Instrumentation`，第二步通过`Instrumentation`接口将实现的`ClassFileTransfomer`注册到JVM上，当JVM去加载类的时候，`ClassFileTransfomer`会获得类的字节数组，并对其进行transform后再返回给JVM，此后该类在Java程序中的表现就是转换之后的结果。

### retransform
上述为类加载时`Instrumentation`在其中所做的工作，但是如果类以及被加载完成后，想要再次对其做转换（适用于多个JavaAgent场景及通过`agentmain`方式运行JavaAgent），就需要使用到`Instrumentation`接口为我们提供的如下方法：

```java
void retransformClasses(Class<?>... classes) throws UnmodifiableClassException
```

其官方描述如下：

> This function facilitates the instrumentation of already loaded classes. When classes are initially loaded or when they are redefined, the initial class file bytes can be transformed with the ClassFileTransformer. This function reruns the transformation process (whether or not a transformation has previously occurred)
> 这个方法将用于对已经加载的类进行插桩，并且是从最初类加载的字节码开始重新应用转换器，并且每一个被注册到JVM的转换器都将会被执行。

通过这个方法，我们就可以对已经被加载的类进行`transform`，执行该方法后的流程如下，其实就是重新触发`ClassFileTransformer`中的`transform`方法:

<MyImage src="/docs-img/transform.png"></MyImage>

值得注意的是，`reTransformClasses` 功能很强大，但是其也有一系列的限制，在官方文档描述中，其限制如下：

> The retransformation must not add, remove or rename fields or methods, change the signatures of methods, or change inheritance.
> 
> 重转换过程中，我们不能新增、删除或者重命名**字段**和**方法**，不能更改方法的签名，不能更改类的继承。

### 字节码分析
上述`reTransformClasses`方法的限制是否是问题产生的根因呢？

在反编译经过SkyWalking增强后的字节码文件后，原因水落石出。类经过Skywalking增强之后的继承关系上多了`implements EnhancedInstance`。这显然改变了类的继承关系，而这一点恰好是官网接口文档中明确描述的限制行为。正是因为这个接口的实现导致了本文开头描述的多个JavaAgent的类冲突增强失败的问题。

该问题在SkyWalking的社区中也有一个相关[issue](https://github.com/apache/skywalking/issues/9701)，社区解释为了减少链路追踪过程中的反射调用确实打破了`reTransformClasses()`的限制，类增强后新增实现了一个接口。

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

## 总结
### 避免多个JavaAgent增强冲突的建议
现在JavaAgent技术越来越受到各大厂商和开源社区的青睐，涌现出不少优秀的JavaAgent框架。开发者或厂商在使用JavaAgent的时候难免会遇到同时挂载多个JavaAgent的场景，如果JavaAgent开发方能够对其他同类框架做到良好的兼容性，将会给使用者带来更少的麻烦，毕竟使用者未必能透彻的了解字节增强的底层原理。

上文经过分析已经找到多个JavaAgent类增强冲突的根因，那么该如何避免此类问题出现呢？这里给出两点较为通用的建议。

### 谨慎安排JavaAgent的挂载顺序
前面我们提到SkyWalking和自研JavaAgent加载顺序会有不同的结果。SkyWalking增强时对类的继承关系有修改，而自研JavaAgent则没有，那么该场景将兼容性相对较低的SkyWalking放在前面，兼容性相对较高的自研JavaAgent放在后面，可以暂时规避类增强的冲突问题。

### 严格遵守字节码增强的使用要求和限制
但是如果我们需要使用3个甚至更多的JavaAgent，上面的方法是治标不治本的。

无论是Byte Buddy、Javassist还是ASM，底层实现都离不开JDK1.5之后引入的`Instrumentation`接口。既然官方接口的设计理念是`reTransformClasses()`增强类时不能新增、删除或者重命名字段和方法，不能更改方法的签名，也不能更改类的继承关系，那作为JavaAgent的框架开发者，应该不要做出超越上述限制的设计，否则极易导致JavaAgent之间的兼容性问题出现。不仅仅是这个接口，JavaAgent框架的开发者也需要遵循所有的字节码增强的底层接口的设计理念，毕竟有规则才有秩序。

### Sermant避免类增强冲突的实践
首先，在自身字节码增强生效的问题上，Sermant严格遵守了上述的字节码增强的官方限制，未改变类的原始继承关系或类方法的签名等，在使用中都未遇到因多个JavaAgent兼容性导致Sermant的字节码增强失效的问题。只需要把Sermant放在最后挂载，基本可以杜绝上文典型的类增强的冲突问题发生。

其次，Sermant不仅要保护自身增强不受其他JavaAgent影响，也考虑到避免Sermant对其他JavaAgent的影响。Sermant计划将`premain`方法中对第三方依赖的使用进行懒加载，将其放置在所有JavaAgent的`premain`方法执行完成后，`main`方法执行的初始阶段进行加载。这样，无论Sermant在多个JavaAgent场景中加载顺序如何，都不会影响其他任何JavaAgent的运行，真正做到不与其他任何JavaAgent发生冲突。

目前市面上和社区的JavaAgent大都是定位于链路追踪或者应用监控领域，Sermant基于服务治理的自身定位，和其他主流JavaAgent不是互相替代的关系，而是友好共存的关系。使用者挂载多个JavaAgent的场景也许并不少见，Sermant避免JavaAgent类增强冲突的做法不仅可以保证客户的业务服务可以不受干扰地运用Sermant提供的限流降级、服务注册、负载均衡、标签路由、优雅上下线、动态配置这些微服务治理能力，也能不干扰客户使用的其他JavaAgent按部就班的工作。
