# Third Party Copyright Statement

This document addresses the copyright of **third party** source code or binary packages involved in the development process

> **Note:**
> Sermant currently used protocol for the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0.html), the License has the following requirements:
>
> 1. An Apache Licence is required for users of the code.
> 2. If you make a change to the code, you need to explain it in the file that was changed.
> 3. Extensions (modifications and code derived from source code) are required to include licenses, trademarks, patent claims, and other aspects of the original code as specified by the original author.
> 4. If a Notice file is included in the release, the Apache Licence is required in the Notice file. You can add your own license to the Notice, but it must not appear to be a change to the Apache Licence.

## Source Code References

If in the code, there are the following conditions, as a **reference** to the **third party** source code:

- **Whole copy** : Directly copy files from **third party** source code and modify them.

- **Partial copying** : Copying part of a **third party** source code method or inner class and using it in your own code.

- **Design reference** : If the developer refers to a **third party** architecture when designing the architecture, and there is the same content in both architectures, it is also considered as a **reference**.

In all three cases, the developer is required to do the following with the files involved:

- Add a note about copying **third parties** source code to your `LICENSE` file, like this:
  ```txt
  The following files contain a portion of ${THIRD PARTY PROJECT NAME} project.
  
  ${RELATED FILE A} in this product is copied from ${THIRD PARTY FILE A} of ${THIRD PARTY PROJECT NAME} project.
  
  ${RELATED FILE B} in this product is copied from ${THIRD PARTY FILE B} of ${THIRD PARTY PROJECT NAME} project.
  
  ...
  
  ${THIRD PARTY PROJECT NAME} project is published at ${THIRD PARTY PROJECT CODEBASES URL} and its license is ${THIRD PARTY PROJECT LICENSE NAME}.
  ```

  Among them:

  - `THIRD PARTY PROJECT NAME` denotes the name of the **third party** project.

  - `RELATED FILE` is the **related file** for this project: in the case of a class, enter the fully qualified name path; Otherwise, type the project relative path.

  - `THIRD PARTY FILE` denotes the **copied file** of the **third party** : if it is a class, type the fully qualified name path; Otherwise, type the project relative path. If the **third-party** project is a single-module project, you can also type a relative path to the source directory.

  - `THIRD PARTY PROJECT CODEBASES URL` denotes the address of the **third party** project codebases; If you can't find the source code warehouse address, you can change it to the official website address or source code download address, in short, the principle is to be traceable.

  - `THIRD PARTY PROJECT LICENSE NAME` refers to the `LICENSE` name of the **third party** project, which is usually referenced to the `licenses` tag in the `pom` file, or pluralized if multiple licenses exist:

    ```txt
    ...
    and its licenses are ${LICENSE A}, ${LICENSE B}, ..., and ${LICENSE C}.
    ```
  - If there is already an entry for the target **third party** project, just hit the middle and fill in the copy information.

- In the **file in question** type the header of the **copied file** (if any) and add the source of the copy, like this:

  ```txt
  Based on ${THIRD PARTY FILE} from the ${THIRD PARTY PROJECT NAME} project.
  ```
- If a **third-party** project contains a `NOTICE` file, append it to the end of the project's `NOTICE` file. If it is already included, there is no need to append it more than once.

## With Dependent Jar Package

If the developer:

- The content of the `resources` tag is not modified
- The `sermant.basedir` argument in the developed module correctly points to the top-level directory
- no `jar` dependencies, or `shade` dependencies without modifying the `transformers` tag

There is no need to make any adjustments to the output `jar` package, otherwise read the instructions below and take it as it is.

In the default packaging process, you need to enter the project's default `LICENSE` file and `NOTICE` file. These files are placed in the `resources/META-INF` directory of the `sermant-package` module and are specifically pointed to by the `resources` tag.

As long as the `sermant.basedir` parameter in the `packaging` module (not a `pom`) points to the top-level directory of the project, these files will be added by default and you don't need to worry about them.

When using the `shade`, `assembly`, or `spring` wrapper to add a dependent `jar`, if any `NOTICE` files are included in the **third-party** `jar`, it is best to merge them with the project's default `NOTICE` file. `shade` plug-in `ApacheNoticeResourceTransformer` just can do this. This is configured in the top-level project's `pom` file, and it is not recommended to override the `shade` plugin Settings unless you need to modify the `Transformer`.

Note: When we refer to the default `LICENSE` file and `NOTICE` file in this section, we are referring to files that only contain information about the project. The `LICENSE` file and `NOTICE` file stored in the top-level directory of the project are the files after sorting out the source code copy information, containing information related to the project and the copied **third party** project information.

## RELEASE Package

The `RELEASE` package needs to include both the `LICENSE` file and the `NOTICE` file with the source code. The former file also needs to add the `LICENSE` information of all **third-party** jar packages included in the `RELEASE` package. The `RELEASE` package also needs to include **third-party** `LICENSE` that are different from the project's `LICENSE` in the `Licenses` directory, which is located in the `resources` directory of the `sermant-package` module.

To summarize, the internal structure of the `RELEASE` product package looks like this:
- `agent` directory: core enhancement logic
- `server` directory: Server side for enhanced logic
- `licenses` directory: the directory where **third-party open source dependencies** `LICENSE` are located, which are different from the project's `LICENSE`
- `LICENSE` file: The project's `LICENSE` file, along with a copy of the `LICENSE` statement of the **third-party open source** source code, and the `LICENSE` statement of the **third-party open source dependencies** `jar` packages included in the `RELEASE` product package
- `NOTICE` file: This project's `NOTICE` file, appends a copy of **third-party open source** source `NOTICE` file.

The project generates a `LICENSE` file, a `NOTICE` file, and a `licenses` directory for the `RELEASE` package as follows:

- Generate `LICENSE` information for all third-party `jar` packages involved in the project via the `license-maven-plugin` plugin:

  ```shell
  mvn license:aggregate-add-third-party
  ```
  The resulting file `LICENSE-binary-suffix-txt` is placed in the `resources` directory of the `sermant-package` module. This process takes a long time to execute at first, so be patient.

- Package project components and export them to a temporary directory.
- When the `sermant-package` module is packaged:
  - Copy the project source's `LICENSE` file, `NOTICE` file, and `licenses` directory into a temporary directory.
  - Call the script to append the `LICENSE-binary-suffix-txt` file to the `LICENSE` file in the temporary directory.
  - Minify the temporary directory into a `RELEASE` package.

With that in mind, developers can compile and RELEASE the `release` package with the following command:
```shell
mvn license:aggregate-add-third-party clean package -Dmaven.test.skip
```