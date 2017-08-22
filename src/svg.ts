/**
 * SVG class for manipulating SVG images.
 */
import { create, WebPage } from "phantom";
import { TextDecoder, TextEncoder } from "text-encoding";
import { ParameterValidation } from "unitejs-framework/dist/helpers/parameterValidation";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
import { DefaultLogger } from "unitejs-framework/dist/loggers/defaultLogger";

export class SVG {
    public async toPng(logger: ILogger,
                       fileSystem: IFileSystem,
                       sourceFolder: string | undefined | null,
                       sourceFile: string | undefined | null,
                       destFolder: string | undefined | null,
                       destFile: string | undefined | null,
                       width: number | undefined | null,
                       height: number | undefined | null,
                       marginX: number | undefined | null,
                       marginY: number | undefined | null,
                       background: string | undefined): Promise<number> {
        let ret;
        let phantom;

        try {
            if (logger === undefined || logger === null) {
                DefaultLogger.log("Unable to continue without logger");
                return 1;
            }

            if (fileSystem === undefined || fileSystem === null) {
                logger.error("Unable to continue without file system");
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "sourceFolder", sourceFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "sourceFile", sourceFile)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "destFolder", destFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "destFile", destFile)) {
                return 1;
            }

            if (width === undefined || width === null || width <= 0) {
                logger.error("width", "parameter must be greater than 0.");
                return 1;
            }

            if (height === undefined || height === null || height <= 0) {
                logger.error("height", "parameter must be greater than 0.");
                return 1;
            }

            if (marginX === undefined) {
                marginX = 0;
            }

            if (marginY === undefined) {
                marginY = 0;
            }

            if (background !== null && background !== undefined && background.length > 0) {
                if (!ParameterValidation.isColor(logger, "background", background)) {
                    return 1;
                }
            }

            const exists = await fileSystem.fileExists(sourceFolder, sourceFile);

            if (exists) {
                phantom = await create();
                const page = await phantom.createPage();

                let style = "* { margin: 0; padding: 0 }";

                if (background && background.length > 0) {
                    style += ` body { background-color: ${background}}`;
                }

                width -= marginX * 2;
                height -= marginY * 2;

                style += ` img { position: absolute; left: ${marginX}px; top: ${marginY}px}`;

                const svgFilename = fileSystem.pathAbsolute(fileSystem.pathCombine(sourceFolder, sourceFile));

                const content = `<html><style>${style}</style><body><img width="${width}" height="${height}" src=\"file:///${svgFilename}\"/></body></html>`;
                await page.property("viewportSize", { width, height });
                await page.property("content", content);
                const base64 = await page.renderBase64("PNG");

                const dirExists = await fileSystem.directoryExists(destFolder);
                if (!dirExists) {
                    await fileSystem.directoryCreate(destFolder);
                }

                await fileSystem.fileWriteBinary(destFolder, destFile, Buffer.from(base64, "base64"));

                ret = 0;
            } else {
                logger.error("Source Image does not exist");
                ret = 1;
            }
        } catch (e) {
            logger.error("Conversion failed", e);
            ret = 1;
        }

        if (phantom) {
            try {
                phantom.exit();
            } catch (e) {
                // Ignore any errors from the exit
            }
        }

        return ret;
    }

    public async toMask(logger: ILogger,
                        fileSystem: IFileSystem,
                        sourceFolder: string,
                        sourceFile: string,
                        destFolder: string,
                        destFile: string): Promise<number> {
        let ret;

        try {
            if (logger === undefined || logger === null) {
                DefaultLogger.log("Unable to continue without logger");
                return 1;
            }

            if (fileSystem === undefined || fileSystem === null) {
                logger.error("Unable to continue without file system");
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "sourceFolder", sourceFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "sourceFile", sourceFile)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "destFolder", destFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "destFile", destFile)) {
                return 1;
            }

            const exists = await fileSystem.fileExists(sourceFolder, sourceFile);

            if (exists) {

                const svgData = await fileSystem.fileReadBinary(sourceFolder, sourceFile);
                let svgText = new TextDecoder().decode(svgData);

                svgText = svgText.replace(/fill=\".*?\"/gi, "fill=\"rgb(0,0,0)\"");

                const dirExists = await fileSystem.directoryExists(destFolder);
                if (!dirExists) {
                    await fileSystem.directoryCreate(destFolder);
                }

                await fileSystem.fileWriteBinary(destFolder, destFile, new TextEncoder().encode(svgText));

                ret = 0;
            } else {
                logger.error("Source Image does not exist");
                ret = 1;
            }
        } catch (e) {
            logger.error("Conversion failed", e);
            ret = 1;
        }

        return ret;
    }
}
