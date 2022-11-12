# Version release

## Current Version

The full version release record can be viewed at [github](https://github.com/huaweicloud/Sermant).

## Release Cycle

- Patch version: The version number is **X.X.X** (the third digit of the version number is not 0), and the patch version is released irregularly. When problems affecting the function are found in the minor version, the Sermant community will repair it in time and release the patch Version
- Minor version: The version number is **X.X.0** (the third digit of the version number is 0, and the second digit of the version number is not 0), the iteration cycle of the minor version is 1-2 months, and new features will be added to the minor version. Published in Sermant [release page](https://github.com/huaweicloud/Sermant/releases), and will summarize and release the new and changed content in the current minor version.
- Major version: The version number is **X.0.0** (the second and third digits of the version number are all 0), the major version is the periodic result of Sermant, the release time unit is in years, and will be carried out before the major version is released. annouce.

**Version 1.0.0** is the fast iteration stage of Sermant before the release. If you want to use it stably, please select the recently released **0.X.0** minor version.

## Version Convention

### Snapshot Version

Snapshot versions will not appear in Sermant's release page, they will be suffixed with **X.X.X-SNAPSHOT** in the Maven central repository. The snapshot version is used to experiment with new features before the stable version is released. Developers can use the snapshot version during the development phase to use the latest features of Sermant and help find problems with new features of Sermant.

### Stable Version

The stable version will appear in Sermant's [release page](https://github.com/huaweicloud/Sermant/releases), and it will be suffixed with **X.X.X** in the new warehouse in Maven. The stable version is released after testing, and each version will not be changed after it is released. If there is any addition or change, it will be reflected in the next stable version.