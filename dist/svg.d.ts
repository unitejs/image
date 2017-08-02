import { IDisplay } from "unitejs-framework/dist/interfaces/IDisplay";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
export declare class SVG {
    toPng(display: IDisplay, fileSystem: IFileSystem, sourceFolder: string, sourceFile: string, destFolder: string, destFile: string, width: string, height: string, marginX: string, marginY: string, background: string): Promise<number>;
    toMask(display: IDisplay, fileSystem: IFileSystem, sourceFolder: string, sourceFile: string, destFolder: string, destFile: string): Promise<number>;
}
