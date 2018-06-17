import * as process from "process";
import { dirname, relative } from "path";
import { createServiceHost } from "./servicehost";
// import * as ts from "typescript";

export function createService(tsconfig) {
    const ts = tsconfig.typescript || require("typescript");
    tsconfig = Object.assign({}, tsconfig);
    delete tsconfig.typescript;

    const defaultCompilerOptions = {
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.ES2015,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        sourceMap: true,
    };

    const cwd = process.cwd();
    const { options, fileNames, errors } = ts.parseJsonConfigFileContent(tsconfig, ts.sys, dirname(""), defaultCompilerOptions);
    if (errors.length) {
        throw new Error(errorMessage(errors[0], cwd));
    }

    // Force a few options
    // These are required to allow rollup (and rollup-watch) to run smoothly
    Object.assign(options, {
        noEmitOnError: false,
        suppressOutputPathCheck: true,
    });

    const host = createServiceHost(options, cwd);
    const reg = ts.createDocumentRegistry();
    const svc = ts.createLanguageService(host, reg);
    const availFiles = fileNames.map(host.normalizePath);
    svc.host = host;

    svc.emit = function (filename) {
        const output = svc.getEmitOutput(filename);
        let diag = svc.getSyntacticDiagnostics(filename);
        if (!diag.length) {
            diag = svc.getCompilerOptionsDiagnostics();
            if (!diag.length) {
                diag = svc.getSemanticDiagnostics(filename);
            }
        }

        output.errors = [];
        output.warnings = [];
        diag.forEach(d => {
            const msg = errorMessage(d, cwd);
            switch (d.category) {
                case ts.DiagnosticCategory.Error:
                    output.errors.push(msg);
                    break;
                case ts.DiagnosticCategory.Warning:
                    output.warnings.push(msg);
                    break;
            }
        });
        return output;
    }

    svc.filter = function (filename) {
        return availFiles.includes(filename);
    }

    return svc;

    function errorMessage(diagnostic, cwd) {
        const text = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        if (!diagnostic.file) {
            return `tsc: ${text}`;
        } else {
            const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            const file = relative(cwd, diagnostic.file.fileName);
            return `${file}:${line + 1}: ${text}`;
        }
    }
}
