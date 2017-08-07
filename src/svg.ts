/**
 * SVG class for manipulating SVG images.
 */
import { create, WebPage } from "phantom";
import { TextDecoder, TextEncoder } from "text-encoding";
import { ParameterValidation } from "unitejs-framework/dist/helpers/parameterValidation";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";

export class SVG {
    public async toPng(logger: ILogger,
                       fileSystem: IFileSystem,
                       sourceFolder: string,
                       sourceFile: string,
                       destFolder: string,
                       destFile: string,
                       width: string,
                       height: string,
                       marginX: string,
                       marginY: string,
                       background: string): Promise<number> {
        let ret;
        let phantom;

        try {
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

            if (!ParameterValidation.isNumeric(logger, "width", width)) {
                return 1;
            }

            if (!ParameterValidation.isNumeric(logger, "height", height)) {
                return 1;
            }

            if (marginX !== null && marginX !== undefined && marginX.length > 0) {
                if (!ParameterValidation.isNumeric(logger, "marginX", marginX)) {
                    return 1;
                }
            } else {
                marginX = "0";
            }

            if (marginY !== null && marginY !== undefined && marginY.length > 0) {
                if (!ParameterValidation.isNumeric(logger, "marginY", marginY)) {
                    return 1;
                }
            } else {
                marginY = "0";
            }

            if (background !== null && background !== undefined && background.length > 0) {
                if (!ParameterValidation.isColor(logger, "background", background)) {
                    return 1;
                }
            }

            phantom = await create();
            const page = await phantom.createPage();

            let style = "* { margin: 0; padding: 0 }";

            if (background && background.length > 0) {
                style += ` body { background-color: ${background}}`;
            }

            let w = parseFloat(width);
            let h = parseFloat(height);
            const marginXPixels = parseFloat(marginX);
            const marginYPixels = parseFloat(marginY);

            w -= marginXPixels * 2;
            h -= marginYPixels * 2;

            style += ` img { position: absolute; left: ${marginXPixels}px; top: ${marginYPixels}px}`;

            const svgFilename = fileSystem.pathCombine(sourceFolder, sourceFile);

            const content = `<html><style>${style}</style><body><img width="${w}" height="${h}" src=\"file:///${svgFilename}\"/></body></html>`;
            await page.property("viewportSize", { width, height });
            await page.property("content", content);
            const base64 = await page.renderBase64("PNG");
            await fileSystem.fileWriteBinary(destFolder, destFile, Buffer.from(base64, "base64"));

            ret = 0;
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

            const svgData = await fileSystem.fileReadBinary(sourceFolder, sourceFile);
            let svgText = new TextDecoder().decode(svgData);

            svgText = svgText.replace(/fill=\".*?\"/gi, "fill=\"rgb(0,0,0)\"");

            await fileSystem.fileWriteBinary(destFolder, destFile, new TextEncoder().encode(svgText));

            ret = 0;
        } catch (e) {
            logger.error("Conversion failed", e);
            ret = 1;
        }

        return ret;
    }
}
