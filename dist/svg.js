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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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b0JBRW5FLE1BQU0sU0FBUyxHQUFHLE1BQU0sVUFBVSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDL0QsSUFBSSxDQUFDLFNBQVMsRUFBRTt3QkFDWixNQUFNLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQ2hEO29CQUVELE1BQU0sVUFBVSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksMkJBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUUxRixHQUFHLEdBQUcsQ0FBQyxDQUFDO2lCQUNYO3FCQUFNO29CQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztvQkFDNUMsR0FBRyxHQUFHLENBQUMsQ0FBQztpQkFDWDthQUNKO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckMsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUNYO1lBRUQsT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDO0tBQUE7Q0FDSjtBQXZMRCxrQkF1TEMiLCJmaWxlIjoic3ZnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTVkcgY2xhc3MgZm9yIG1hbmlwdWxhdGluZyBTVkcgaW1hZ2VzLlxuICovXG5pbXBvcnQgeyBjcmVhdGUsIFdlYlBhZ2UgfSBmcm9tIFwicGhhbnRvbVwiO1xuaW1wb3J0IHsgVGV4dERlY29kZXIsIFRleHRFbmNvZGVyIH0gZnJvbSBcInRleHQtZW5jb2RpbmdcIjtcbmltcG9ydCB7IFBhcmFtZXRlclZhbGlkYXRpb24gfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9oZWxwZXJzL3BhcmFtZXRlclZhbGlkYXRpb25cIjtcbmltcG9ydCB7IElGaWxlU3lzdGVtIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvaW50ZXJmYWNlcy9JRmlsZVN5c3RlbVwiO1xuaW1wb3J0IHsgSUxvZ2dlciB9IGZyb20gXCJ1bml0ZWpzLWZyYW1ld29yay9kaXN0L2ludGVyZmFjZXMvSUxvZ2dlclwiO1xuaW1wb3J0IHsgRGVmYXVsdExvZ2dlciB9IGZyb20gXCJ1bml0ZWpzLWZyYW1ld29yay9kaXN0L2xvZ2dlcnMvZGVmYXVsdExvZ2dlclwiO1xuXG5leHBvcnQgY2xhc3MgU1ZHIHtcbiAgICBwdWJsaWMgYXN5bmMgdG9QbmcobG9nZ2VyOiBJTG9nZ2VyLFxuICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtOiBJRmlsZVN5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRm9sZGVyOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGaWxlOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICBkZXN0Rm9sZGVyOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICBkZXN0RmlsZTogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luWDogbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luWTogbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogc3RyaW5nIHwgdW5kZWZpbmVkKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgbGV0IHJldDtcbiAgICAgICAgbGV0IHBoYW50b207XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChsb2dnZXIgPT09IHVuZGVmaW5lZCB8fCBsb2dnZXIgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBEZWZhdWx0TG9nZ2VyLmxvZyhcIlVuYWJsZSB0byBjb250aW51ZSB3aXRob3V0IGxvZ2dlclwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpbGVTeXN0ZW0gPT09IHVuZGVmaW5lZCB8fCBmaWxlU3lzdGVtID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiVW5hYmxlIHRvIGNvbnRpbnVlIHdpdGhvdXQgZmlsZSBzeXN0ZW1cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwic291cmNlRm9sZGVyXCIsIHNvdXJjZUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJzb3VyY2VGaWxlXCIsIHNvdXJjZUZpbGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwiZGVzdEZvbGRlclwiLCBkZXN0Rm9sZGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcImRlc3RGaWxlXCIsIGRlc3RGaWxlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAod2lkdGggPT09IHVuZGVmaW5lZCB8fCB3aWR0aCA9PT0gbnVsbCB8fCB3aWR0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwid2lkdGhcIiwgXCJwYXJhbWV0ZXIgbXVzdCBiZSBncmVhdGVyIHRoYW4gMC5cIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKFwid2lkdGhcIiwgeyB3aWR0aCB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhlaWdodCA9PT0gdW5kZWZpbmVkIHx8IGhlaWdodCA9PT0gbnVsbCB8fCBoZWlnaHQgPD0gMCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcImhlaWdodFwiLCBcInBhcmFtZXRlciBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAwLlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJoZWlnaHRcIiwgeyBoZWlnaHQgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG1YID0gbWFyZ2luWCA9PT0gdW5kZWZpbmVkID8gMCA6IG1hcmdpblg7XG4gICAgICAgICAgICBjb25zdCBtWSA9IG1hcmdpblkgPT09IHVuZGVmaW5lZCA/IDAgOiBtYXJnaW5ZO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJtYXJnaW5YXCIsIHsgbVggfSk7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhcIm1hcmdpbllcIiwgeyBtWSB9KTtcblxuICAgICAgICAgICAgaWYgKGJhY2tncm91bmQgIT09IG51bGwgJiYgYmFja2dyb3VuZCAhPT0gdW5kZWZpbmVkICYmIGJhY2tncm91bmQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5pc0NvbG9yKGxvZ2dlciwgXCJiYWNrZ3JvdW5kXCIsIGJhY2tncm91bmQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZXhpc3RzID0gYXdhaXQgZmlsZVN5c3RlbS5maWxlRXhpc3RzKHNvdXJjZUZvbGRlciwgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgICAgICAgICBwaGFudG9tID0gYXdhaXQgY3JlYXRlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFnZSA9IGF3YWl0IHBoYW50b20uY3JlYXRlUGFnZSgpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHN0eWxlID0gXCIqIHsgbWFyZ2luOiAwOyBwYWRkaW5nOiAwIH1cIjtcblxuICAgICAgICAgICAgICAgIGlmIChiYWNrZ3JvdW5kICYmIGJhY2tncm91bmQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZSArPSBgIGJvZHkgeyBiYWNrZ3JvdW5kLWNvbG9yOiAke2JhY2tncm91bmR9fWA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVkdWNlZFdpZHRoID0gd2lkdGggLSAobVggKiAyKTtcbiAgICAgICAgICAgICAgICBzdHlsZSArPSBgIGltZyB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogJHttWH1weDsgdG9wOiAke21ZfXB4fWA7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVkdWNlZEhlaWdodCA9IGhlaWdodCAtIChtYXJnaW5ZICogMik7XG5cbiAgICAgICAgICAgICAgICBzdHlsZSArPSBgIGltZyB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogJHttWH1weDsgdG9wOiAke21ZfXB4fWA7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzdmdGaWxlbmFtZSA9IGZpbGVTeXN0ZW0ucGF0aEFic29sdXRlKGZpbGVTeXN0ZW0ucGF0aENvbWJpbmUoc291cmNlRm9sZGVyLCBzb3VyY2VGaWxlKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYDxodG1sPjxzdHlsZT4ke3N0eWxlfTwvc3R5bGU+PGJvZHk+PGltZyB3aWR0aD1cIiR7cmVkdWNlZFdpZHRofVwiIGhlaWdodD1cIiR7cmVkdWNlZEhlaWdodH1cIiBzcmM9XFxcImZpbGU6Ly8vJHtzdmdGaWxlbmFtZX1cXFwiLz48L2JvZHk+PC9odG1sPmA7XG4gICAgICAgICAgICAgICAgYXdhaXQgcGFnZS5wcm9wZXJ0eShcInZpZXdwb3J0U2l6ZVwiLCB7IHdpZHRoLCBoZWlnaHQgfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgcGFnZS5wcm9wZXJ0eShcImNvbnRlbnRcIiwgY29udGVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gYXdhaXQgcGFnZS5yZW5kZXJCYXNlNjQoXCJQTkdcIik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkaXJFeGlzdHMgPSBhd2FpdCBmaWxlU3lzdGVtLmRpcmVjdG9yeUV4aXN0cyhkZXN0Rm9sZGVyKTtcbiAgICAgICAgICAgICAgICBpZiAoIWRpckV4aXN0cykge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBmaWxlU3lzdGVtLmRpcmVjdG9yeUNyZWF0ZShkZXN0Rm9sZGVyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBmaWxlU3lzdGVtLmZpbGVXcml0ZUJpbmFyeShkZXN0Rm9sZGVyLCBkZXN0RmlsZSwgQnVmZmVyLmZyb20oYmFzZTY0LCBcImJhc2U2NFwiKSk7XG5cbiAgICAgICAgICAgICAgICByZXQgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJTb3VyY2UgSW1hZ2UgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICAgICAgICAgICAgcmV0ID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiQ29udmVyc2lvbiBmYWlsZWRcIiwgZSk7XG4gICAgICAgICAgICByZXQgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBoYW50b20pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGhhbnRvbS5leGl0KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGFueSBlcnJvcnMgZnJvbSB0aGUgZXhpdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdG9NYXNrKGxvZ2dlcjogSUxvZ2dlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW06IElGaWxlU3lzdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRm9sZGVyOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGaWxlOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0Rm9sZGVyOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0RmlsZTogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgbGV0IHJldDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGxvZ2dlciA9PT0gdW5kZWZpbmVkIHx8IGxvZ2dlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIERlZmF1bHRMb2dnZXIubG9nKFwiVW5hYmxlIHRvIGNvbnRpbnVlIHdpdGhvdXQgbG9nZ2VyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlsZVN5c3RlbSA9PT0gdW5kZWZpbmVkIHx8IGZpbGVTeXN0ZW0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJVbmFibGUgdG8gY29udGludWUgd2l0aG91dCBmaWxlIHN5c3RlbVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJzb3VyY2VGb2xkZXJcIiwgc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZpbGVcIiwgc291cmNlRmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0Rm9sZGVyXCIsIGRlc3RGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwiZGVzdEZpbGVcIiwgZGVzdEZpbGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGZpbGVTeXN0ZW0uZmlsZUV4aXN0cyhzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgICBpZiAoZXhpc3RzKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzdmdEYXRhID0gYXdhaXQgZmlsZVN5c3RlbS5maWxlUmVhZEJpbmFyeShzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgICAgIGxldCBzdmdUZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHN2Z0RhdGEpO1xuXG4gICAgICAgICAgICAgICAgc3ZnVGV4dCA9IHN2Z1RleHQucmVwbGFjZSgvZmlsbD1cXFwiLio/XFxcIi9naSwgXCJmaWxsPVxcXCJyZ2IoMCwwLDApXFxcIlwiKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRpckV4aXN0cyA9IGF3YWl0IGZpbGVTeXN0ZW0uZGlyZWN0b3J5RXhpc3RzKGRlc3RGb2xkZXIpO1xuICAgICAgICAgICAgICAgIGlmICghZGlyRXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0uZGlyZWN0b3J5Q3JlYXRlKGRlc3RGb2xkZXIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0uZmlsZVdyaXRlQmluYXJ5KGRlc3RGb2xkZXIsIGRlc3RGaWxlLCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3ZnVGV4dCkpO1xuXG4gICAgICAgICAgICAgICAgcmV0ID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiU291cmNlIEltYWdlIGRvZXMgbm90IGV4aXN0XCIpO1xuICAgICAgICAgICAgICAgIHJldCA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkNvbnZlcnNpb24gZmFpbGVkXCIsIGUpO1xuICAgICAgICAgICAgcmV0ID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxufVxuIl19
