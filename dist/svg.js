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
                const mX = marginX === undefined ? 0 : marginX;
                const mY = marginY === undefined ? 0 : marginY;
                logger.info("marginX", { mX });
                logger.info("marginY", { mY });
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
                    const reducedWidth = width - (mX * 2);
                    style += ` img { position: absolute; left: ${mX}px; top: ${mY}px}`;
                    const reducedHeight = height - (marginY * 2);
                    style += ` img { position: absolute; left: ${mX}px; top: ${mY}px}`;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QztvQkFFRCxNQUFNLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLDJCQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFFMUYsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDWixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztvQkFDNUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDWixDQUFDO1lBQ0wsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUM7WUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2YsQ0FBQztLQUFBO0NBQ0o7QUF2TEQsa0JBdUxDIiwiZmlsZSI6InN2Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU1ZHIGNsYXNzIGZvciBtYW5pcHVsYXRpbmcgU1ZHIGltYWdlcy5cbiAqL1xuaW1wb3J0IHsgY3JlYXRlLCBXZWJQYWdlIH0gZnJvbSBcInBoYW50b21cIjtcbmltcG9ydCB7IFRleHREZWNvZGVyLCBUZXh0RW5jb2RlciB9IGZyb20gXCJ0ZXh0LWVuY29kaW5nXCI7XG5pbXBvcnQgeyBQYXJhbWV0ZXJWYWxpZGF0aW9uIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvaGVscGVycy9wYXJhbWV0ZXJWYWxpZGF0aW9uXCI7XG5pbXBvcnQgeyBJRmlsZVN5c3RlbSB9IGZyb20gXCJ1bml0ZWpzLWZyYW1ld29yay9kaXN0L2ludGVyZmFjZXMvSUZpbGVTeXN0ZW1cIjtcbmltcG9ydCB7IElMb2dnZXIgfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9pbnRlcmZhY2VzL0lMb2dnZXJcIjtcbmltcG9ydCB7IERlZmF1bHRMb2dnZXIgfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9sb2dnZXJzL2RlZmF1bHRMb2dnZXJcIjtcblxuZXhwb3J0IGNsYXNzIFNWRyB7XG4gICAgcHVibGljIGFzeW5jIHRvUG5nKGxvZ2dlcjogSUxvZ2dlcixcbiAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbTogSUZpbGVTeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZvbGRlcjogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZTogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZvbGRlcjogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZpbGU6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblg6IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblk6IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIGxldCByZXQ7XG4gICAgICAgIGxldCBwaGFudG9tO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAobG9nZ2VyID09PSB1bmRlZmluZWQgfHwgbG9nZ2VyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgRGVmYXVsdExvZ2dlci5sb2coXCJVbmFibGUgdG8gY29udGludWUgd2l0aG91dCBsb2dnZXJcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtID09PSB1bmRlZmluZWQgfHwgZmlsZVN5c3RlbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVuYWJsZSB0byBjb250aW51ZSB3aXRob3V0IGZpbGUgc3lzdGVtXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZvbGRlclwiLCBzb3VyY2VGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwic291cmNlRmlsZVwiLCBzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcImRlc3RGb2xkZXJcIiwgZGVzdEZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0RmlsZVwiLCBkZXN0RmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHdpZHRoID09PSB1bmRlZmluZWQgfHwgd2lkdGggPT09IG51bGwgfHwgd2lkdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIndpZHRoXCIsIFwicGFyYW1ldGVyIG11c3QgYmUgZ3JlYXRlciB0aGFuIDAuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhcIndpZHRoXCIsIHsgd2lkdGggfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCBoZWlnaHQgPT09IG51bGwgfHwgaGVpZ2h0IDw9IDApIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJoZWlnaHRcIiwgXCJwYXJhbWV0ZXIgbXVzdCBiZSBncmVhdGVyIHRoYW4gMC5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKFwiaGVpZ2h0XCIsIHsgaGVpZ2h0IH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtWCA9IG1hcmdpblggPT09IHVuZGVmaW5lZCA/IDAgOiBtYXJnaW5YO1xuICAgICAgICAgICAgY29uc3QgbVkgPSBtYXJnaW5ZID09PSB1bmRlZmluZWQgPyAwIDogbWFyZ2luWTtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKFwibWFyZ2luWFwiLCB7IG1YIH0pO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJtYXJnaW5ZXCIsIHsgbVkgfSk7XG5cbiAgICAgICAgICAgIGlmIChiYWNrZ3JvdW5kICE9PSBudWxsICYmIGJhY2tncm91bmQgIT09IHVuZGVmaW5lZCAmJiBiYWNrZ3JvdW5kLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24uaXNDb2xvcihsb2dnZXIsIFwiYmFja2dyb3VuZFwiLCBiYWNrZ3JvdW5kKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGZpbGVTeXN0ZW0uZmlsZUV4aXN0cyhzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgICBpZiAoZXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgcGhhbnRvbSA9IGF3YWl0IGNyZWF0ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBwaGFudG9tLmNyZWF0ZVBhZ2UoKTtcblxuICAgICAgICAgICAgICAgIGxldCBzdHlsZSA9IFwiKiB7IG1hcmdpbjogMDsgcGFkZGluZzogMCB9XCI7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFja2dyb3VuZCAmJiBiYWNrZ3JvdW5kLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUgKz0gYCBib2R5IHsgYmFja2dyb3VuZC1jb2xvcjogJHtiYWNrZ3JvdW5kfX1gO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlZHVjZWRXaWR0aCA9IHdpZHRoIC0gKG1YICogMik7XG4gICAgICAgICAgICAgICAgc3R5bGUgKz0gYCBpbWcgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6ICR7bVh9cHg7IHRvcDogJHttWX1weH1gO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZHVjZWRIZWlnaHQgPSBoZWlnaHQgLSAobWFyZ2luWSAqIDIpO1xuXG4gICAgICAgICAgICAgICAgc3R5bGUgKz0gYCBpbWcgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6ICR7bVh9cHg7IHRvcDogJHttWX1weH1gO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3ZnRmlsZW5hbWUgPSBmaWxlU3lzdGVtLnBhdGhBYnNvbHV0ZShmaWxlU3lzdGVtLnBhdGhDb21iaW5lKHNvdXJjZUZvbGRlciwgc291cmNlRmlsZSkpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGA8aHRtbD48c3R5bGU+JHtzdHlsZX08L3N0eWxlPjxib2R5PjxpbWcgd2lkdGg9XCIke3JlZHVjZWRXaWR0aH1cIiBoZWlnaHQ9XCIke3JlZHVjZWRIZWlnaHR9XCIgc3JjPVxcXCJmaWxlOi8vLyR7c3ZnRmlsZW5hbWV9XFxcIi8+PC9ib2R5PjwvaHRtbD5gO1xuICAgICAgICAgICAgICAgIGF3YWl0IHBhZ2UucHJvcGVydHkoXCJ2aWV3cG9ydFNpemVcIiwgeyB3aWR0aCwgaGVpZ2h0IH0pO1xuICAgICAgICAgICAgICAgIGF3YWl0IHBhZ2UucHJvcGVydHkoXCJjb250ZW50XCIsIGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IGF3YWl0IHBhZ2UucmVuZGVyQmFzZTY0KFwiUE5HXCIpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlyRXhpc3RzID0gYXdhaXQgZmlsZVN5c3RlbS5kaXJlY3RvcnlFeGlzdHMoZGVzdEZvbGRlcik7XG4gICAgICAgICAgICAgICAgaWYgKCFkaXJFeGlzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZmlsZVN5c3RlbS5kaXJlY3RvcnlDcmVhdGUoZGVzdEZvbGRlcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgZmlsZVN5c3RlbS5maWxlV3JpdGVCaW5hcnkoZGVzdEZvbGRlciwgZGVzdEZpbGUsIEJ1ZmZlci5mcm9tKGJhc2U2NCwgXCJiYXNlNjRcIikpO1xuXG4gICAgICAgICAgICAgICAgcmV0ID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiU291cmNlIEltYWdlIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgICAgICAgICAgIHJldCA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkNvbnZlcnNpb24gZmFpbGVkXCIsIGUpO1xuICAgICAgICAgICAgcmV0ID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaGFudG9tKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBoYW50b20uZXhpdCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBhbnkgZXJyb3JzIGZyb20gdGhlIGV4aXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHRvTWFzayhsb2dnZXI6IElMb2dnZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtOiBJRmlsZVN5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZvbGRlcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZvbGRlcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZpbGU6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIGxldCByZXQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChsb2dnZXIgPT09IHVuZGVmaW5lZCB8fCBsb2dnZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBEZWZhdWx0TG9nZ2VyLmxvZyhcIlVuYWJsZSB0byBjb250aW51ZSB3aXRob3V0IGxvZ2dlclwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpbGVTeXN0ZW0gPT09IHVuZGVmaW5lZCB8fCBmaWxlU3lzdGVtID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiVW5hYmxlIHRvIGNvbnRpbnVlIHdpdGhvdXQgZmlsZSBzeXN0ZW1cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwic291cmNlRm9sZGVyXCIsIHNvdXJjZUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJzb3VyY2VGaWxlXCIsIHNvdXJjZUZpbGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwiZGVzdEZvbGRlclwiLCBkZXN0Rm9sZGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcImRlc3RGaWxlXCIsIGRlc3RGaWxlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBleGlzdHMgPSBhd2FpdCBmaWxlU3lzdGVtLmZpbGVFeGlzdHMoc291cmNlRm9sZGVyLCBzb3VyY2VGaWxlKTtcblxuICAgICAgICAgICAgaWYgKGV4aXN0cykge1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3ZnRGF0YSA9IGF3YWl0IGZpbGVTeXN0ZW0uZmlsZVJlYWRCaW5hcnkoc291cmNlRm9sZGVyLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICAgICAgICBsZXQgc3ZnVGV4dCA9IG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShzdmdEYXRhKTtcblxuICAgICAgICAgICAgICAgIHN2Z1RleHQgPSBzdmdUZXh0LnJlcGxhY2UoL2ZpbGw9XFxcIi4qP1xcXCIvZ2ksIFwiZmlsbD1cXFwicmdiKDAsMCwwKVxcXCJcIik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkaXJFeGlzdHMgPSBhd2FpdCBmaWxlU3lzdGVtLmRpcmVjdG9yeUV4aXN0cyhkZXN0Rm9sZGVyKTtcbiAgICAgICAgICAgICAgICBpZiAoIWRpckV4aXN0cykge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBmaWxlU3lzdGVtLmRpcmVjdG9yeUNyZWF0ZShkZXN0Rm9sZGVyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBmaWxlU3lzdGVtLmZpbGVXcml0ZUJpbmFyeShkZXN0Rm9sZGVyLCBkZXN0RmlsZSwgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHN2Z1RleHQpKTtcblxuICAgICAgICAgICAgICAgIHJldCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlNvdXJjZSBJbWFnZSBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgICAgICAgICAgICByZXQgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJDb252ZXJzaW9uIGZhaWxlZFwiLCBlKTtcbiAgICAgICAgICAgIHJldCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbn1cbiJdfQ==
