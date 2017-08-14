import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
export declare class SVG {
    toPng(logger: ILogger, fileSystem: IFileSystem, sourceFolder: string | undefined | null, sourceFile: string | undefined | null, destFolder: string | undefined | null, destFile: string | undefined | null, width: number | undefined | null, height: number | undefined | null, marginX: number | undefined | null, marginY: number | undefined | null, background: string | undefined): Promise<number>;
    toMask(logger: ILogger, fileSystem: IFileSystem, sourceFolder: string, sourceFile: string, destFolder: string, destFile: string): Promise<number>;
}
