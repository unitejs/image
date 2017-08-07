import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
export declare class SVG {
    toPng(logger: ILogger, fileSystem: IFileSystem, sourceFolder: string, sourceFile: string, destFolder: string, destFile: string, width: string, height: string, marginX: string, marginY: string, background: string): Promise<number>;
    toMask(logger: ILogger, fileSystem: IFileSystem, sourceFolder: string, sourceFile: string, destFolder: string, destFile: string): Promise<number>;
}
