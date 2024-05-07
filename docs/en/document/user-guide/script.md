# Dynamic Install and Uninstall Script User Manual

[Sermant dynamic installation and uninstallation scripts](https://github.com/sermant-io/Sermant/blob/develop/scripts/attach.c) is a C language script implemented based on the Java Attach API, which can mount sermant to **JVM process on a virtual machine** or  **JVM process on a container**.

> Note: This script is only available for use on **Linux systems**

## Parameter configuration

- `-path=`：Required parameter, followed by the **absolute path of servant-agent.jar**

- `-pid=`：Required parameter, followed by the host application's PID, can be viewed using commands such as `ps - ef`

- `-command=`：Required parameter, followed by the instruction to mount the servant. The supported instructions can be found in the [Sermant-agent User Manual](./servant-agent.md)

- `-nspid=`：When the host application container is running, it is a required parameter, followed by the host application's nspid, which can be viewed using the `cat/proc/{pid}/status` command. Do not fill in this parameter when the host application is running on a virtual machine

## Steps for using scripts

### 1. Compile `jvm_attach.c`

```bash
gcc attach.c -o attach
```

> Note: Please ensure that gcc has been installed

### 2. Execute attach script

```bash
./attach -path={sermant-path}/sermant-agent.jar -pid={pid} -command={COMMAND}
```

The execution status of the script is as follows:

```shell
[root@b6b9af8e5610 root]# ./attach -path=/home/sermant-agent-1.0.0/agent/sermant-agent.jar -pid=494 -command=INSTALL-PLUGINS:database-write-prohibition
[INFO]: PATH: /home/sermant-agent-1.0.0/agent/sermant-agent.jar
[INFO]: PID: 494
[INFO]: COMMAND: INSTALL-PLUGINS:database-write-prohibition
[INFO]: Connected to remote JVM of pid 494
[INFO]: ret code is 0, Attach success!
```
