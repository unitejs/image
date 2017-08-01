/**
 * SVG class for manipulating SVG images.
 */
import { create, WebPage } from "phantom";
import { TextDecoder, TextEncoder } from "text-encoding";
import { ColorHelper } from "unitejs-framework/dist/helpers/colorHelper";
import { ParameterValidation } from "unitejs-framework/dist/helpers/parameterValidation";
import { IDisplay } from "unitejs-framework/dist/interfaces/IDisplay";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";

export class SVG {
    public async toPng(display: IDisplay,
                       fileSystem: IFileSystem,
                       sourceFolder: string,
                       sourceFile: string,
                       destFolder: string,
                       destFile: string,
                       width: string,
                       height: string,
                       margin: string,
                       background: string): Promise<number> {
        let ret;
        let phantom;

        try {
            display.info("Converting SVG to PNG");

            if (!ParameterValidation.notEmpty(display, "sourceFolder", sourceFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(display, "sourceFile", sourceFile)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(display, "destFolder", destFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(display, "destFile", destFile)) {
                return 1;
            }

            if (!ParameterValidation.isNumeric(display, "width", width)) {
                return 1;
            }

            if (!ParameterValidation.isNumeric(display, "height", height)) {
                return 1;
            }

            if (margin !== null && margin !== undefined && margin.length > 0) {
                if (!ParameterValidation.isNumeric(display, "margin", margin)) {
                    return 1;
                }
            } else {
                margin = "0";
            }

            if (background !== null && background !== undefined && background.length > 0) {
                if (!ParameterValidation.isColor(display, "background", background)) {
                    return 1;
                }
            }

            phantom = await create();
            const page = await phantom.createPage();

            let style = "* { margin: 0; padding: 0 }";

            if (background && background.length > 0) {
                style += ` body { background-color: ${background}}`;
            }

            const w = parseFloat(width);
            const h = parseFloat(height);
            const marginP = parseFloat(margin);

            const marginWidth = w * ((100 - marginP) / 100);
            const marginHeight = h * ((100 - marginP) / 100);

            if (marginP > 0) {
                const leftOffset = Math.abs((w - marginWidth) / 2);
                const topOffset = Math.abs((h - marginHeight) / 2);
                style += ` img { position: absolute; left: ${leftOffset}px; top: ${topOffset}px}`;
            }

            const svgFilename = fileSystem.pathCombine(sourceFolder, sourceFile);

            const content = `<html><style>${style}</style><body><img width="${marginWidth}" height="${marginHeight}" src=\"file:///${svgFilename}\"/></body></html>`;
            await page.property("viewportSize", { width, height });
            await page.property("content", content);
            const base64 = await page.renderBase64("PNG");
            await fileSystem.fileWriteBinary(destFolder, destFile, Buffer.from(base64, "base64"));

            ret = 0;
        } catch (e) {
            display.error("Conversion failed", e);
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

    public async toMask(display: IDisplay,
                        fileSystem: IFileSystem,
                        sourceFolder: string,
                        sourceFile: string,
                        destFolder: string,
                        destFile: string,
                        mask: string): Promise<number> {
        let ret;

        try {
            display.info("Converting SVG to Mask");

            if (!ParameterValidation.notEmpty(display, "sourceFolder", sourceFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(display, "sourceFile", sourceFile)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(display, "destFolder", destFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(display, "destFile", destFile)) {
                return 1;
            }

            if (!ParameterValidation.isColor(display, "mask", mask)) {
                return 1;
            }

            const svgData = await fileSystem.fileReadBinary(sourceFolder, sourceFile);
            let svgText = new TextDecoder().decode(svgData);

            const rgb = ColorHelper.parseHex(mask);
            /* tslint:disable */
            if (rgb) {
                console.log(`fill=\"rgb\\(${rgb.r},${rgb.g},${rgb.b}\\)\"`);
                console.log(`fill=\"${mask}\"`);
                svgText = svgText.replace(new RegExp(`fill=\"rgb\\(${rgb.r},${rgb.g},${rgb.b}\\)\"`, "gi"), "fill=\"rgb(0,0,0)\"");
                svgText = svgText.replace(new RegExp(`fill=\"${mask}\"`, "gi"), "fill=\"rgb(0,0,0)\"");
            }

            await fileSystem.fileWriteBinary(destFolder, destFile, new TextEncoder().encode(svgText));

            ret = 0;
        } catch (e) {
            display.error("Conversion failed", e);
            ret = 1;
        }

        return ret;
    }
}
