"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * SVG class for manipulating SVG images.
 */
const phantom_1 = require("phantom");
const text_encoding_1 = require("text-encoding");
const parameterValidation_1 = require("unitejs-framework/dist/helpers/parameterValidation");
const defaultLogger_1 = require("unitejs-framework/dist/loggers/defaultLogger");
class SVG {
    toPng(logger, fileSystem, sourceFolder, sourceFile, destFolder, destFile, width, height, marginX, marginY, background) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret;
            let phantom;
            try {
                if (logger === undefined || logger === null) {
                    defaultLogger_1.DefaultLogger.log("Unable to continue without logger");
                    return 1;
                }
                if (fileSystem === undefined || fileSystem === null) {
                    logger.error("Unable to continue without file system");
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "sourceFolder", sourceFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "sourceFile", sourceFile)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "destFolder", destFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "destFile", destFile)) {
                    return 1;
                }
                if (width === undefined || width === null || width <= 0) {
                    logger.error("width", "parameter must be greater than 0.");
                    return 1;
                }
                else {
                    logger.info("width", { width });
                }
                if (height === undefined || height === null || height <= 0) {
                    logger.error("height", "parameter must be greater than 0.");
                    return 1;
                }
                else {
                    logger.info("height", { height });
                }
                if (marginX === undefined) {
                    marginX = 0;
                }
                else {
                    logger.info("marginX", { marginX });
                }
                if (marginY === undefined) {
                    marginY = 0;
                }
                else {
                    logger.info("marginY", { marginY });
                }
                if (background !== null && background !== undefined && background.length > 0) {
                    if (!parameterValidation_1.ParameterValidation.isColor(logger, "background", background)) {
                        return 1;
                    }
                }
                const exists = yield fileSystem.fileExists(sourceFolder, sourceFile);
                if (exists) {
                    phantom = yield phantom_1.create();
                    const page = yield phantom.createPage();
                    let style = "* { margin: 0; padding: 0 }";
                    if (background && background.length > 0) {
                        style += ` body { background-color: ${background}}`;
                    }
                    const reducedWidth = width - (marginX * 2);
                    const reducedHeight = height - (marginY * 2);
                    style += ` img { position: absolute; left: ${marginX}px; top: ${marginY}px}`;
                    const svgFilename = fileSystem.pathAbsolute(fileSystem.pathCombine(sourceFolder, sourceFile));
                    const content = `<html><style>${style}</style><body><img width="${reducedWidth}" height="${reducedHeight}" src=\"file:///${svgFilename}\"/></body></html>`;
                    yield page.property("viewportSize", { width, height });
                    yield page.property("content", content);
                    const base64 = yield page.renderBase64("PNG");
                    const dirExists = yield fileSystem.directoryExists(destFolder);
                    if (!dirExists) {
                        yield fileSystem.directoryCreate(destFolder);
                    }
                    yield fileSystem.fileWriteBinary(destFolder, destFile, Buffer.from(base64, "base64"));
                    ret = 0;
                }
                else {
                    logger.error("Source Image does not exist");
                    ret = 1;
                }
            }
            catch (e) {
                logger.error("Conversion failed", e);
                ret = 1;
            }
            if (phantom) {
                try {
                    phantom.exit();
                }
                catch (e) {
                    // Ignore any errors from the exit
                }
            }
            return ret;
        });
    }
    toMask(logger, fileSystem, sourceFolder, sourceFile, destFolder, destFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret;
            try {
                if (logger === undefined || logger === null) {
                    defaultLogger_1.DefaultLogger.log("Unable to continue without logger");
                    return 1;
                }
                if (fileSystem === undefined || fileSystem === null) {
                    logger.error("Unable to continue without file system");
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "sourceFolder", sourceFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "sourceFile", sourceFile)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "destFolder", destFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "destFile", destFile)) {
                    return 1;
                }
                const exists = yield fileSystem.fileExists(sourceFolder, sourceFile);
                if (exists) {
                    const svgData = yield fileSystem.fileReadBinary(sourceFolder, sourceFile);
                    let svgText = new text_encoding_1.TextDecoder().decode(svgData);
                    svgText = svgText.replace(/fill=\".*?\"/gi, "fill=\"rgb(0,0,0)\"");
                    const dirExists = yield fileSystem.directoryExists(destFolder);
                    if (!dirExists) {
                        yield fileSystem.directoryCreate(destFolder);
                    }
                    yield fileSystem.fileWriteBinary(destFolder, destFile, new text_encoding_1.TextEncoder().encode(svgText));
                    ret = 0;
                }
                else {
                    logger.error("Source Image does not exist");
                    ret = 1;
                }
            }
            catch (e) {
                logger.error("Conversion failed", e);
                ret = 1;
            }
            return ret;
        });
    }
}
exports.SVG = SVG;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2pELENBQUM7b0JBRUQsTUFBTSxVQUFVLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSwyQkFBVyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBRTFGLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ1osQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7b0JBQzVDLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ1osQ0FBQztZQUNMLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNULE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDWixDQUFDO1lBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNmLENBQUM7S0FBQTtDQUNKO0FBN0xELGtCQTZMQyIsImZpbGUiOiJzdmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFNWRyBjbGFzcyBmb3IgbWFuaXB1bGF0aW5nIFNWRyBpbWFnZXMuXG4gKi9cbmltcG9ydCB7IGNyZWF0ZSwgV2ViUGFnZSB9IGZyb20gXCJwaGFudG9tXCI7XG5pbXBvcnQgeyBUZXh0RGVjb2RlciwgVGV4dEVuY29kZXIgfSBmcm9tIFwidGV4dC1lbmNvZGluZ1wiO1xuaW1wb3J0IHsgUGFyYW1ldGVyVmFsaWRhdGlvbiB9IGZyb20gXCJ1bml0ZWpzLWZyYW1ld29yay9kaXN0L2hlbHBlcnMvcGFyYW1ldGVyVmFsaWRhdGlvblwiO1xuaW1wb3J0IHsgSUZpbGVTeXN0ZW0gfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9pbnRlcmZhY2VzL0lGaWxlU3lzdGVtXCI7XG5pbXBvcnQgeyBJTG9nZ2VyIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvaW50ZXJmYWNlcy9JTG9nZ2VyXCI7XG5pbXBvcnQgeyBEZWZhdWx0TG9nZ2VyIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvbG9nZ2Vycy9kZWZhdWx0TG9nZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBTVkcge1xuICAgIHB1YmxpYyBhc3luYyB0b1BuZyhsb2dnZXI6IElMb2dnZXIsXG4gICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW06IElGaWxlU3lzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGb2xkZXI6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGU6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIGRlc3RGb2xkZXI6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIGRlc3RGaWxlOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5YOiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5ZOiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBsZXQgcmV0O1xuICAgICAgICBsZXQgcGhhbnRvbTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGxvZ2dlciA9PT0gdW5kZWZpbmVkIHx8IGxvZ2dlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIERlZmF1bHRMb2dnZXIubG9nKFwiVW5hYmxlIHRvIGNvbnRpbnVlIHdpdGhvdXQgbG9nZ2VyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlsZVN5c3RlbSA9PT0gdW5kZWZpbmVkIHx8IGZpbGVTeXN0ZW0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJVbmFibGUgdG8gY29udGludWUgd2l0aG91dCBmaWxlIHN5c3RlbVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJzb3VyY2VGb2xkZXJcIiwgc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZpbGVcIiwgc291cmNlRmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0Rm9sZGVyXCIsIGRlc3RGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwiZGVzdEZpbGVcIiwgZGVzdEZpbGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh3aWR0aCA9PT0gdW5kZWZpbmVkIHx8IHdpZHRoID09PSBudWxsIHx8IHdpZHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJ3aWR0aFwiLCBcInBhcmFtZXRlciBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAwLlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJ3aWR0aFwiLCB7IHdpZHRoIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGVpZ2h0ID09PSB1bmRlZmluZWQgfHwgaGVpZ2h0ID09PSBudWxsIHx8IGhlaWdodCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiaGVpZ2h0XCIsIFwicGFyYW1ldGVyIG11c3QgYmUgZ3JlYXRlciB0aGFuIDAuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhcImhlaWdodFwiLCB7IGhlaWdodCB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1hcmdpblggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG1hcmdpblggPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhcIm1hcmdpblhcIiwgeyBtYXJnaW5YIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWFyZ2luWSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWFyZ2luWSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKFwibWFyZ2luWVwiLCB7IG1hcmdpblkgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChiYWNrZ3JvdW5kICE9PSBudWxsICYmIGJhY2tncm91bmQgIT09IHVuZGVmaW5lZCAmJiBiYWNrZ3JvdW5kLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24uaXNDb2xvcihsb2dnZXIsIFwiYmFja2dyb3VuZFwiLCBiYWNrZ3JvdW5kKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGZpbGVTeXN0ZW0uZmlsZUV4aXN0cyhzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgICBpZiAoZXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgcGhhbnRvbSA9IGF3YWl0IGNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBwaGFudG9tLmNyZWF0ZVBhZ2UoKTtcblxuICAgICAgICAgICAgICAgIGxldCBzdHlsZSA9IFwiKiB7IG1hcmdpbjogMDsgcGFkZGluZzogMCB9XCI7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFja2dyb3VuZCAmJiBiYWNrZ3JvdW5kLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUgKz0gYCBib2R5IHsgYmFja2dyb3VuZC1jb2xvcjogJHtiYWNrZ3JvdW5kfX1gO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZHVjZWRXaWR0aCA9IHdpZHRoIC0gKG1hcmdpblggKiAyKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWR1Y2VkSGVpZ2h0ID0gaGVpZ2h0IC0gKG1hcmdpblkgKiAyKTtcblxuICAgICAgICAgICAgICAgIHN0eWxlICs9IGAgaW1nIHsgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAke21hcmdpblh9cHg7IHRvcDogJHttYXJnaW5ZfXB4fWA7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzdmdGaWxlbmFtZSA9IGZpbGVTeXN0ZW0ucGF0aEFic29sdXRlKGZpbGVTeXN0ZW0ucGF0aENvbWJpbmUoc291cmNlRm9sZGVyLCBzb3VyY2VGaWxlKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYDxodG1sPjxzdHlsZT4ke3N0eWxlfTwvc3R5bGU+PGJvZHk+PGltZyB3aWR0aD1cIiR7cmVkdWNlZFdpZHRofVwiIGhlaWdodD1cIiR7cmVkdWNlZEhlaWdodH1cIiBzcmM9XFxcImZpbGU6Ly8vJHtzdmdGaWxlbmFtZX1cXFwiLz48L2JvZHk+PC9odG1sPmA7XG4gICAgICAgICAgICAgICAgYXdhaXQgcGFnZS5wcm9wZXJ0eShcInZpZXdwb3J0U2l6ZVwiLCB7IHdpZHRoLCBoZWlnaHQgfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgcGFnZS5wcm9wZXJ0eShcImNvbnRlbnRcIiwgY29udGVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gYXdhaXQgcGFnZS5yZW5kZXJCYXNlNjQoXCJQTkdcIik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkaXJFeGlzdHMgPSBhd2FpdCBmaWxlU3lzdGVtLmRpcmVjdG9yeUV4aXN0cyhkZXN0Rm9sZGVyKTtcbiAgICAgICAgICAgICAgICBpZiAoIWRpckV4aXN0cykge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBmaWxlU3lzdGVtLmRpcmVjdG9yeUNyZWF0ZShkZXN0Rm9sZGVyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBmaWxlU3lzdGVtLmZpbGVXcml0ZUJpbmFyeShkZXN0Rm9sZGVyLCBkZXN0RmlsZSwgQnVmZmVyLmZyb20oYmFzZTY0LCBcImJhc2U2NFwiKSk7XG5cbiAgICAgICAgICAgICAgICByZXQgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJTb3VyY2UgSW1hZ2UgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICAgICAgICAgICAgcmV0ID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiQ29udmVyc2lvbiBmYWlsZWRcIiwgZSk7XG4gICAgICAgICAgICByZXQgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBoYW50b20pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGhhbnRvbS5leGl0KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGFueSBlcnJvcnMgZnJvbSB0aGUgZXhpdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdG9NYXNrKGxvZ2dlcjogSUxvZ2dlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW06IElGaWxlU3lzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRm9sZGVyOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGaWxlOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0Rm9sZGVyOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0RmlsZTogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgbGV0IHJldDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGxvZ2dlciA9PT0gdW5kZWZpbmVkIHx8IGxvZ2dlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIERlZmF1bHRMb2dnZXIubG9nKFwiVW5hYmxlIHRvIGNvbnRpbnVlIHdpdGhvdXQgbG9nZ2VyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlsZVN5c3RlbSA9PT0gdW5kZWZpbmVkIHx8IGZpbGVTeXN0ZW0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJVbmFibGUgdG8gY29udGludWUgd2l0aG91dCBmaWxlIHN5c3RlbVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJzb3VyY2VGb2xkZXJcIiwgc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZpbGVcIiwgc291cmNlRmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0Rm9sZGVyXCIsIGRlc3RGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwiZGVzdEZpbGVcIiwgZGVzdEZpbGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGZpbGVTeXN0ZW0uZmlsZUV4aXN0cyhzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgICBpZiAoZXhpc3RzKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzdmdEYXRhID0gYXdhaXQgZmlsZVN5c3RlbS5maWxlUmVhZEJpbmFyeShzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgIGxldCBzdmdUZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHN2Z0RhdGEpO1xuXG4gICAgICAgICAgICAgICAgc3ZnVGV4dCA9IHN2Z1RleHQucmVwbGFjZSgvZmlsbD1cXFwiLio/XFxcIi9naSwgXCJmaWxsPVxcXCJyZ2IoMCwwLDApXFxcIlwiKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRpckV4aXN0cyA9IGF3YWl0IGZpbGVTeXN0ZW0uZGlyZWN0b3J5RXhpc3RzKGRlc3RGb2xkZXIpO1xuICAgICAgICAgICAgICAgIGlmICghZGlyRXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0uZGlyZWN0b3J5Q3JlYXRlKGRlc3RGb2xkZXIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0uZmlsZVdyaXRlQmluYXJ5KGRlc3RGb2xkZXIsIGRlc3RGaWxlLCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3ZnVGV4dCkpO1xuXG4gICAgICAgICAgICAgICAgcmV0ID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiU291cmNlIEltYWdlIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgICAgICAgICAgIHJldCA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkNvbnZlcnNpb24gZmFpbGVkXCIsIGUpO1xuICAgICAgICAgICAgcmV0ID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxufVxuIl19
