# Version Management

This document is about versioning **Sermant**.

**Sermant** directly use [versions-maven-plugin](https://github.com/mojohaus/versions-maven-plugin) do version management , commonly used commands are as follows:

- The updated version number is `${version}`：
  ```shell
  mvn versions:set -DnewVersion=${version}
  ```
  By default, this command keeps the original `pom` file backup.
- Rollback version number:
  ```shell
  mvn versions:revert
  ```
- Commit the new version update, i.e. delete the original `pom` file backup:
  ```shell
  mvn versions:commit
  ```
- Update version to `${version}` and commit:
  ```shell
  mvn versions:set -DnewVersion=${version} -DgenerateBackupPoms=false
  ```
  This command will not back up the original `pom` file, be careful not to write the version number wrong when using it.

In the above update command, only the modules that have the same version as the top-level module in the project will be modified. If you need to update a module separately, you can use the `-pl` flag, for example:
```shell
mvn versions:set -DnewVersion=${version} -DgenerateBackupPoms=false -pl ${module}
```
Where `${module}` can pass `${groupId}:${artifactId}`, can also pass relative path. In the case of multiple modules, use the `','` sign.

More information about the `versions:set` command can be found here [Versions Maven Plugin versions:set](http://www.mojohaus.org/versions-maven-plugin/set-mojo.html)。

More `versions-maven-plugin` commands can be found in [Versions Maven Plugin Introduction](http://www.mojohaus.org/versions-maven-plugin/index.html)。