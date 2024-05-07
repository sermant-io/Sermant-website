# 动态安装卸载脚本使用手册

[Sermant动态安装、卸载脚本](https://github.com/sermant-io/Sermant/blob/develop/scripts/attach.c)是基于Java Attach API实现的C语言脚本，可以将sermant挂载至**虚拟机上的jvm进程**或**容器上的jvm进程**。

> 注：该脚本仅限**linux系统**下使用

## 参数配置

- `-path=`：必填参数，后接sermant-agent.jar的**绝对路径**

- `-pid=`：必填参数，后接宿主应用的pid，可使用`ps -ef`等命令查看

- `-command=`：必填参数，后接挂载sermant的指令，支持的指令见[Sermant Agent使用手册](./sermant-agent.md)。

- `-nspid=`：当宿主应用容器运行时为必填参数，后接宿主应用的nspid，可使用`cat /proc/{pid}/status`命令查看。当宿主应用非容器运行时，此参数请勿填写

## 脚本使用步骤

### 1. 编译`jvm_attach.c`

```bash
gcc attach.c -o attach
```

> 注：请确保已经安装gcc

### 2. 执行attach脚本

```bash
./attach -path={sermant-path}/sermant-agent.jar -pid={pid} -command={COMMAND}
```

脚本执行情况如下所示：

```shell
[root@b6b9af8e5610 root]# ./attach -path=/home/sermant-agent-1.0.0/agent/sermant-agent.jar -pid=494 -command=INSTALL-PLUGINS:database-write-prohibition
[INFO]: PATH: /home/sermant-agent-1.0.0/agent/sermant-agent.jar
[INFO]: PID: 494
[INFO]: COMMAND: INSTALL-PLUGINS:database-write-prohibition
[INFO]: Connected to remote JVM of pid 494
[INFO]: ret code is 0, Attach success!
```
