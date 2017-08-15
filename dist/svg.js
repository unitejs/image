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
                    width -= marginX * 2;
                    height -= marginY * 2;
                    style += ` img { position: absolute; left: ${marginX}px; top: ${marginY}px}`;
                    const svgFilename = fileSystem.pathCombine(sourceFolder, sourceFile);
                    const content = `<html><style>${style}</style><body><img width="${width}" height="${height}" src=\"file:///${svgFilename}\"/></body></html>`;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFBO0NBQ0o7QUFyTEQsa0JBcUxDIiwiZmlsZSI6InN2Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU1ZHIGNsYXNzIGZvciBtYW5pcHVsYXRpbmcgU1ZHIGltYWdlcy5cbiAqL1xuaW1wb3J0IHsgY3JlYXRlLCBXZWJQYWdlIH0gZnJvbSBcInBoYW50b21cIjtcbmltcG9ydCB7IFRleHREZWNvZGVyLCBUZXh0RW5jb2RlciB9IGZyb20gXCJ0ZXh0LWVuY29kaW5nXCI7XG5pbXBvcnQgeyBQYXJhbWV0ZXJWYWxpZGF0aW9uIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvaGVscGVycy9wYXJhbWV0ZXJWYWxpZGF0aW9uXCI7XG5pbXBvcnQgeyBJRmlsZVN5c3RlbSB9IGZyb20gXCJ1bml0ZWpzLWZyYW1ld29yay9kaXN0L2ludGVyZmFjZXMvSUZpbGVTeXN0ZW1cIjtcbmltcG9ydCB7IElMb2dnZXIgfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9pbnRlcmZhY2VzL0lMb2dnZXJcIjtcbmltcG9ydCB7IERlZmF1bHRMb2dnZXIgfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9sb2dnZXJzL2RlZmF1bHRMb2dnZXJcIjtcblxuZXhwb3J0IGNsYXNzIFNWRyB7XG4gICAgcHVibGljIGFzeW5jIHRvUG5nKGxvZ2dlcjogSUxvZ2dlcixcbiAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbTogSUZpbGVTeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZvbGRlcjogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZTogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZvbGRlcjogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZpbGU6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblg6IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblk6IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIGxldCByZXQ7XG4gICAgICAgIGxldCBwaGFudG9tO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAobG9nZ2VyID09PSB1bmRlZmluZWQgfHwgbG9nZ2VyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgRGVmYXVsdExvZ2dlci5sb2coXCJVbmFibGUgdG8gY29udGludWUgd2l0aG91dCBsb2dnZXJcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtID09PSB1bmRlZmluZWQgfHwgZmlsZVN5c3RlbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVuYWJsZSB0byBjb250aW51ZSB3aXRob3V0IGZpbGUgc3lzdGVtXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZvbGRlclwiLCBzb3VyY2VGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwic291cmNlRmlsZVwiLCBzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcImRlc3RGb2xkZXJcIiwgZGVzdEZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0RmlsZVwiLCBkZXN0RmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHdpZHRoID09PSB1bmRlZmluZWQgfHwgd2lkdGggPT09IG51bGwgfHwgd2lkdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIndpZHRoXCIsIFwicGFyYW1ldGVyIG11c3QgYmUgZ3JlYXRlciB0aGFuIDAuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGVpZ2h0ID09PSB1bmRlZmluZWQgfHwgaGVpZ2h0ID09PSBudWxsIHx8IGhlaWdodCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiaGVpZ2h0XCIsIFwicGFyYW1ldGVyIG11c3QgYmUgZ3JlYXRlciB0aGFuIDAuXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWFyZ2luWCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWFyZ2luWCA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtYXJnaW5ZID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBtYXJnaW5ZID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJhY2tncm91bmQgIT09IG51bGwgJiYgYmFja2dyb3VuZCAhPT0gdW5kZWZpbmVkICYmIGJhY2tncm91bmQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5pc0NvbG9yKGxvZ2dlciwgXCJiYWNrZ3JvdW5kXCIsIGJhY2tncm91bmQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZXhpc3RzID0gYXdhaXQgZmlsZVN5c3RlbS5maWxlRXhpc3RzKHNvdXJjZUZvbGRlciwgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgICAgICAgICBwaGFudG9tID0gYXdhaXQgY3JlYXRlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFnZSA9IGF3YWl0IHBoYW50b20uY3JlYXRlUGFnZSgpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHN0eWxlID0gXCIqIHsgbWFyZ2luOiAwOyBwYWRkaW5nOiAwIH1cIjtcblxuICAgICAgICAgICAgICAgIGlmIChiYWNrZ3JvdW5kICYmIGJhY2tncm91bmQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZSArPSBgIGJvZHkgeyBiYWNrZ3JvdW5kLWNvbG9yOiAke2JhY2tncm91bmR9fWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2lkdGggLT0gbWFyZ2luWCAqIDI7XG4gICAgICAgICAgICAgICAgaGVpZ2h0IC09IG1hcmdpblkgKiAyO1xuXG4gICAgICAgICAgICAgICAgc3R5bGUgKz0gYCBpbWcgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6ICR7bWFyZ2luWH1weDsgdG9wOiAke21hcmdpbll9cHh9YDtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHN2Z0ZpbGVuYW1lID0gZmlsZVN5c3RlbS5wYXRoQ29tYmluZShzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGA8aHRtbD48c3R5bGU+JHtzdHlsZX08L3N0eWxlPjxib2R5PjxpbWcgd2lkdGg9XCIke3dpZHRofVwiIGhlaWdodD1cIiR7aGVpZ2h0fVwiIHNyYz1cXFwiZmlsZTovLy8ke3N2Z0ZpbGVuYW1lfVxcXCIvPjwvYm9keT48L2h0bWw+YDtcbiAgICAgICAgICAgICAgICBhd2FpdCBwYWdlLnByb3BlcnR5KFwidmlld3BvcnRTaXplXCIsIHsgd2lkdGgsIGhlaWdodCB9KTtcbiAgICAgICAgICAgICAgICBhd2FpdCBwYWdlLnByb3BlcnR5KFwiY29udGVudFwiLCBjb250ZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlNjQgPSBhd2FpdCBwYWdlLnJlbmRlckJhc2U2NChcIlBOR1wiKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRpckV4aXN0cyA9IGF3YWl0IGZpbGVTeXN0ZW0uZGlyZWN0b3J5RXhpc3RzKGRlc3RGb2xkZXIpO1xuICAgICAgICAgICAgICAgIGlmICghZGlyRXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0uZGlyZWN0b3J5Q3JlYXRlKGRlc3RGb2xkZXIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0uZmlsZVdyaXRlQmluYXJ5KGRlc3RGb2xkZXIsIGRlc3RGaWxlLCBCdWZmZXIuZnJvbShiYXNlNjQsIFwiYmFzZTY0XCIpKTtcblxuICAgICAgICAgICAgICAgIHJldCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlNvdXJjZSBJbWFnZSBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgICAgICAgICAgICByZXQgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJDb252ZXJzaW9uIGZhaWxlZFwiLCBlKTtcbiAgICAgICAgICAgIHJldCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGhhbnRvbSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBwaGFudG9tLmV4aXQoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgYW55IGVycm9ycyBmcm9tIHRoZSBleGl0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyB0b01hc2sobG9nZ2VyOiBJTG9nZ2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbTogSUZpbGVTeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGb2xkZXI6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RGb2xkZXI6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RGaWxlOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBsZXQgcmV0O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAobG9nZ2VyID09PSB1bmRlZmluZWQgfHwgbG9nZ2VyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgRGVmYXVsdExvZ2dlci5sb2coXCJVbmFibGUgdG8gY29udGludWUgd2l0aG91dCBsb2dnZXJcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtID09PSB1bmRlZmluZWQgfHwgZmlsZVN5c3RlbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVuYWJsZSB0byBjb250aW51ZSB3aXRob3V0IGZpbGUgc3lzdGVtXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZvbGRlclwiLCBzb3VyY2VGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwic291cmNlRmlsZVwiLCBzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcImRlc3RGb2xkZXJcIiwgZGVzdEZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0RmlsZVwiLCBkZXN0RmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZXhpc3RzID0gYXdhaXQgZmlsZVN5c3RlbS5maWxlRXhpc3RzKHNvdXJjZUZvbGRlciwgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICAgIGlmIChleGlzdHMpIHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHN2Z0RhdGEgPSBhd2FpdCBmaWxlU3lzdGVtLmZpbGVSZWFkQmluYXJ5KHNvdXJjZUZvbGRlciwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgbGV0IHN2Z1RleHQgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoc3ZnRGF0YSk7XG5cbiAgICAgICAgICAgICAgICBzdmdUZXh0ID0gc3ZnVGV4dC5yZXBsYWNlKC9maWxsPVxcXCIuKj9cXFwiL2dpLCBcImZpbGw9XFxcInJnYigwLDAsMClcXFwiXCIpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGlyRXhpc3RzID0gYXdhaXQgZmlsZVN5c3RlbS5kaXJlY3RvcnlFeGlzdHMoZGVzdEZvbGRlcik7XG4gICAgICAgICAgICAgICAgaWYgKCFkaXJFeGlzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZmlsZVN5c3RlbS5kaXJlY3RvcnlDcmVhdGUoZGVzdEZvbGRlcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgZmlsZVN5c3RlbS5maWxlV3JpdGVCaW5hcnkoZGVzdEZvbGRlciwgZGVzdEZpbGUsIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzdmdUZXh0KSk7XG5cbiAgICAgICAgICAgICAgICByZXQgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJTb3VyY2UgSW1hZ2UgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICAgICAgICAgICAgcmV0ID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiQ29udmVyc2lvbiBmYWlsZWRcIiwgZSk7XG4gICAgICAgICAgICByZXQgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG59XG4iXX0=
