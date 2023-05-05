# Plugin Development FAQs

This document mainly explains common problems encountered when developing the Sermant plugin.

## Why does the plugin service module need to introduce its corresponding plugin main module in its pom in the provided form?

The class loaders of the plugin service module and plugin main module are inconsistent. If the corresponding plugin main module is not introduced in the provided form, the plugin main module will not be able to obtain the service instance of the plugin service module through the PluginServiceManager. getService method.