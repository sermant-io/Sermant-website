# 数据库禁写

本文介绍[数据库禁写插件](https://github.com/sermant-io/Sermant/tree/develop/sermant-plugins/sermant-database-write-prohibition)及其使用方式。

## 功能介绍

数据库是用于存储、管理和检索数据的系统。数据库按照数据模型分类一般分为关系型数据库和非关系型数据库，其中，目前使用较多的关系型数据库有MySQL、OpenGauss、PostgreSQL等，非关系型数据库则有MongoDB等。

在特定业务场景下，用户希望停止对个别或全部数据库的写入操作，仅允许读取数据，以保证数据库系统的数据完整性、一致性和安全性。比如，在多云多活架构系统中，某业务数据库写入仅允许操作中心节点，通过开启数据库禁写插件，使路由异常流量写入非中心节点数据库失败，避免发生数据冲突从而保证数据库数据的一致性。

本插件着手于以非侵入的方式解决微服务在运行过程中动态开启或关闭数据库禁写能力的问题。用户可以通过下发动态配置，指定微服务需要禁写的数据库，从而实现对特定数据库的禁止写入能力。

###  快速开始

本插件的快速上手使用教程可参考[操作和结果验证](#操作和结果验证)。

## 支持版本和限制

### 支持版本

数据库禁写插件目前支持MySQL、MongoDB、PostgreSQL和OpenGauss数据库，具体支持的客户端版本如下：

| 数据库客户端 | 版本                       |
| ---------- | -------------------------- |
| mongodb-driver-sync | 2.6.2-2.7.x, 3.0.x-3.3.x |
| mariadb-java-client | 3.7.x-3.11.x, 4.0.x-4.11.x |
| opengauss-jdbc | 3.0.x, 3.1.x |
| postgresql | 9.4.x, 42.0.x-42.7.x |

### 使用说明及限制

数据库禁写插件必须使用动态配置中心来下发配置，使用说明请参考[参数配置](#参数配置)章节。

- 关系型数据库支持禁写的写操作：数据插入、更新和删除，创建和删除表，创建和删除索引，修改表结构。支持禁止写的示例SQL语句如下表所示：

| 操作类型 | 示例SQL语句                      |
| ---------- | -------------------------- |
| 创建表 | CREATE TABLE table_demo (id INT)|
| 插入数据 | INSERT INTO table_demo VALUES (1)|
| 更新数据 | UPDATE table_demo SET id = 2 WHERE id = 1|
| 删除数据 | DELETE FROM table_demo WHERE id = 1|
| 创建索引 | CREATE INDEX idx_id ON table_demo (id) |
| 删除索引 | DROP INDEX idx_id ON table_demo |
| 修改表结构 | ALTER TABLE table_demo ADD COLUMN name VARCHAR(20) |
| 删除表 | DROP TABLE table_demo |

- MongoDB数据库支持禁写的写操作：文档插入、更新、替换和删除，创建和删除集合，创建和删除索引。支持禁止写的示例MongoDB命令如下表所示：

| 操作类型 | 示例MongoDB命令                      |
| ---------- | -------------------------- |
| 创建集合 | db.createCollection("collection_demo")|
| 插入文档 | db.collection_demo.insertOne({"id": 1})|
| 更新文档 | db.collection_demo.updateOne({ "id": 1 },{ $set: {"id": 2 } })|
| 替换文档 | db.collection_demo.replaceOne({ "id": 1 },{"id": 2 })|
| 删除文档 | db.collection_demo.deleteOne({ "id": 1})|
| 创建索引 | db.collection_demo.createIndex({ "id":1 }) |
| 删除索引 | db.collection_demo.dropIndex("id_1") |
| 删除集合 | db.collection_demo.drop() |

**禁写实现方式：**
对于被禁止写入的数据库，当执行以上写操作时，Sermant Agent会向宿主服务抛出`java.sql.SQLException`异常。
## 参数配置

数据库禁写插件必须使用动态配置中心来下发配置，配置发布可以参考[动态配置中心使用手册](https://sermant.io/zh/document/user-guide/configuration-center.html#发布配置)。动态配置模型中的`group`, `key`, `content` 分别对应如下：

- **group**

  group为**app=${service.meta.application}&environment=${service.meta.environment}&zone=${service.meta.zone}**，

  其中`${service.meta.application}`，`${service.meta.environment}`以及`${service.meta.zone}`在Sermant的配置文件`sermant-agent-x.x.x/agent/config.properties`中配置。group的默认值为`app=default&environment=&zone=`。

- **key**

  key分为两类。

  全局配置：key为固定值**sermant.database.write.globalConfig**，其优先级大于局部配置。

  局部配置：微服务的局部配置，key为**sermant.database.write.${service.meta.service}**，其中`${service.meta.service}`在Sermant的配置文件`sermant-agent-x.x.x/agent/config.properties`中配置。

  在同时配置的情况下，若全局配置禁写开关打开，则全局配置生效，否则局部配置生效。

- **content**

  content为具体的数据库禁写配置内容，遵循yaml的格式。

  `enableMongoDbWriteProhibition`控制MongoDB禁写开关，`mongoDbDatabases`配置需要禁写的MongoDB数据库列表。

  `enableMySqlWriteProhibition`控制MySQL禁写开关，`mySqlDatabases`配置需要禁写的MySQL数据库列表。

  `enablePostgreSqlWriteProhibition`控制PostgreSQL禁写开关，`postgreSqlDatabases`配置需要禁写的PostgreSQL数据库列表。

  `enableOpenGaussWriteProhibition`控制OpenGauss禁写开关，`openGaussDatabases`配置需要禁写的OpenGauss数据库列表。
  

  ```yaml
  enableMongoDbWriteProhibition: true
  mongoDbDatabases:
   - mongodb-database-1
   - mongodb-database-2
  enableMySqlWriteProhibition: true
  mySqlDatabases:
   - mysql-database-1
  enablePostgreSqlWriteProhibition: true
  postgreSqlDatabases:
   - postgresql-database-1
  enableOpenGaussWriteProhibition: true
  openGaussDatabases:
   - opengauss-database-1
  ```

> 注意：如果是新增或者更新配置，新配置将会在Sermant中直接全部覆盖刷新。如果是删除配置，那么Sermant中的数据库禁写开关将关闭，数据库列表置空。

## 操作和结果验证

本节内容以操作MongoDB数据库的示例微服务来演示数据库禁写插件的能力。示例中通过在ZooKeeper中下发动态配置，指定禁写的数据库类型和名称，通过调用实例微服务接口创建和查询MongoDB集合来验证数据库禁写插件的能力。

### 准备工作

- [下载 ](https://github.com/sermant-io/Sermant/releases/download/v1.4.0/sermant-1.4.0.tar.gz)Sermant Release包

- [下载](https://zookeeper.apache.org/releases.html#download) ZooKeeper Release包
- [下载](https://www.mongodb.com/try/download/community)MongoDB 安装包并安装
- [下载](https://github.com/sermant-io/Sermant-examples/releases/download/v1.4.0/sermant-examples-database-write-prohibition-demo-1.4.0.tar.gz) Demo二进制产物压缩包

### 步骤一：获取Demo二进制产物

解压Demo二进制产物压缩包，即可得到`mongodb-demo.jar`。

### 步骤二：部署动态配置中心ZooKeeper

解压ZooKeeper Release包，将`conf/zoo_sample.cfg`拷贝至`conf/zoo.cfg`后，通过执行以下脚本即可启动ZooKeeper:

```shell
sh bin/zkServer.sh start
```

ZooKeeper的使用说明可参阅[官网](https://zookeeper.apache.org/doc/current/zookeeperStarted.html)。

### 步骤三：启动MongoDB

安装MongoDB数据库后，通过执行以下脚本即可启动MongoDB:

```shell
sudo systemctl start mongod
```

MongoDB的安装可参阅[官网](https://www.mongodb.com/docs/v4.2/installation/#mongodb-community-edition-installation-tutorials)。

### 步骤四：部署应用

执行以下命令挂载Sermant启动Demo应用:

```shell
java -javaagent:${path}/sermant-agent-x.x.x/agent/sermant-agent.jar -jar mongodb.jar
```

> 说明：此处${path}为sermant-agent包所在路径。

### 步骤五：创建MongoDB集合

执行以下命令调用Demo接口创建集合:

```shell
curl http://127.0.0.1:30110/createCollection?databaseName=mongodb-database-1&collectionName=collection-test-1
```
输出结果如下所示：
```shell
Collection collection-test-1 successfully created
```
执行以下命令调用Demo接口查询已经创建的集合:

```shell
curl http://127.0.0.1:30110/queryCollection？databaseName=mongodb-database-1
```

输出结果如下所示：
```shell
Current Collection: [collection-test-1]
```
输出如上所示结果，则说明集合创建成功。
> 说明：此处${path}为sermant-agent包所在路径。


### 步骤六：发布配置

配置MongoDB禁写规则，参考[动态配置中心使用手册](../user-guide/configuration-center.md#发布配置)中Zookeeper进行配置发布。

其中key值为**sermant.database.write.globalConfig**，group为**app=default&environment=&zone=**，content为具体的禁止消费规则，如下所示：

```yaml
enableMongoDbWriteProhibition: true
mongoDbDatabases:
  - mongodb-database-1
```

其中，通过`enableMongoDbWriteProhibition`开启MongoDB数据库禁写能力，通过`mongoDbDatabases`配置指定禁写的数据库名称。

利用ZooKeeper提供的命令行工具发布以上配置：
1. 在`${zookeeper-path}/bin/`目录执行以下命令创建配置模型的group节点`/app=default&environment=&zone=`：

```shell
# linux
./zkCli.sh -server localhost:2181 create /app=default&environment=&zone=
```

2. 创建完成group节点后，在`${zookeeper-path}/bin/`目录执行以下命令创建配置模型的key节点`/sermant.database.write.globalConfig`，并设置节点的content：

```shell
# linux
./zkCli.sh -server localhost:2181 create /sermant.database.write.globalConfig "enableMongoDbWriteProhibition: true
mongoDbDatabases:
  - mongodb-database-1"
```
> 说明：${zookeeper-path}为ZooKeeper的安装目录。

### 结果验证

#### 禁写配置下发后创建集合

执行以下命令调用Demo接口创建MongoDB集合:

```shell
curl http://127.0.0.1:30110/createCollection?databaseName=mongodb-database-1&collectionName=collection-test-2
```
输出结果如下所示，MongoDB数据库禁写执行生效：
```shell
Collection collection-test-2 failed to be created
```

#### 查询已创建的集合

执行以下命令调用Demo接口查询已经创建的MongoDB集合:

```shell
curl http://127.0.0.1:30110/queryCollection？databaseName=mongodb-database-1
```

输出结果如下所示，collection-test-2集合未被创建，MongoDB数据库禁写执行生效：
```shell
Current Collection: [collection-test-1]
```