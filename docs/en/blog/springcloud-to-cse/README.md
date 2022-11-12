# Zero code modification, teach you easy access to CSE for Spring Cloud applications
## 1. Description of Sergeant Agent
Servant Agent is an agentless service mesh technology based on JavaAgent. It utilizes JavaAgent to detect host applications and has enhanced service governance capabilities to address service governance issues in massive microservice architectures.

Servant Agent is in the stage of rapid development and currently supports a variety of service governance capabilities, including traffic governance, registration, graceful online and offline, and dynamic configuration capabilities.

## 2. Why use Sermant Agent

### Zero code intrusion, simple configuration
Compared with the SDK access, the access based on the Sermant Agent will be faster and more efficient, the configuration is simple, and the application does not need any code modification. It only needs to attach the Sermant Agent when the service is started to dynamically access the CSE.

### Support multiple governance capabilities
Servant Agent integrates traffic governance capabilities by default. Currently, it supports circuit breaker, current limiting, isolation bin, and retry governance capabilities. This capability can be configured and released based on the CSE configuration center.

### Support multiple registries
Servant Agent currently supports mainstream registration centers in the industry, and has already supported ServiceComb ServiceCenter, Naocs, Eureka, Zookeeper, etc. under development.

### Support non-stop application migration
Servant Agent supports dual registration of services. It can dynamically modify the subscription policy of the current service according to the service subscription policy issued by the configuration center, and based on this capability, it can help online applications to complete service migration without interruption of business.

Not only that, the Sermant Agent provides graceful online and offline capabilities, and provides guarantees when services are restarted and online. While protecting services, they can avoid traffic loss problems that may exist when services are offline.

## 3. Access principle
Of course, before explaining the principle, we first need to understand what is Java Agent.

Java Agent is a new feature introduced after JDK1.5. It supports JVM to read bytecode files into memory, and before JVM uses the corresponding byte stream to generate a Class object in the Java heap, users can read the bytecode file to the Java heap. The ability to modify, the JVM uses the modified bytecode to create Class objects, so as to realize the modification and replacement of non-code-intrusive business logic of Java applications.

Servant Agent is based on the technology of dynamically modifying the bytecode. When the service starts, it dynamically enhances the registration logic of the original service. How does the Sermant Agent access the CSE without modifying the code? The main process is as follows:

<MyImage src="/docs-img/sermant-cse-diagram.png"></MyImage>

Contains the following 6 steps:

(1) First, the service is started with the Sermant Agent.

(2) When the service starts, the bytecode enhancement operation (bytecode enhancement based on Java Agent) is performed for the service, mainly for registration and configuration, which are reflected in steps 3-5.

(3) Through bytecode enhancement, dynamically identify the registry of the original application.

(4) Inject the startup configuration to dynamically close the registry automatic configuration logic of the original application.

(5) Then, the automatic configuration class of registered CSE based on Spring Cloud implementation is injected through Spring's SpringFactory mechanism, which is taken over by Spring.

(6) When the application initiates the registration, it will initiate the registration to the CSE through the registration logic injected in step 5, and finally complete the access.

## 4. Simple zero code modification, easy access to CSE
The access scenarios are divided into virtual machine access and container access. You can choose the appropriate access method according to your own needs.

### Accessing the CSE in a Virtual Machine Scenario
Applications deployed on virtual machines can be connected to the CSE through the Sermant Agent.

Access process

The process of connecting applications to CSE based on ECS is as follows:

<MyImage src="/docs-img/virtual-machine-cse.png"></MyImage>

### Container scenario access to CSE
The application deployed in the container can automatically mount the Sermant Agent through the Sermant Injector, so as to connect to the CSE through the Sermant Agent.

Access process

The process of connecting applications to CSE based on CCE is as follows:

<MyImage src="/docs-img/container-to-cse.png"></MyImage>

## 5. More
### Supported version
At present, Sermant has supported most mainstream versions in the industry. The relevant Spring and registry versions are as follows:

<MyImage src="/docs-img/support-version.png"></MyImage>