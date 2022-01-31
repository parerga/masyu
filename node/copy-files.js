const fs = require('fs');
const path = require('path');

/*
const copy = [{
    srcDir: 'Директория, из которой копируются файлы. Добавляется к пути в files и не входит в результирующий путь',
    destDir: 'Директория, куда копируются файлы. По умолчанию: ./dist',
    clear: 'Предварительно очистить destDir. По умолчанию: false',
    verbose: 'Подробный вывод. По умолчанию: false',
    files: [
        'Массив файлов для копирования. Каждый элемент - это строка-путь к файлу или объекта вида:',
        {
            from: 'Файл или директория для копирования',
            to: 'Куда копировать и новое имя файла или директории',
            exactly: 'Если true используются точные пути, если false или не указано - к to добавляется destDir, \
                      а к from добавляется srcDir'
        }
    ]
}]
*/

const configFile = process.argv[2] || 'package.json';
const defaultOptions = {
    srcDir: '',
    destDir: './dist/',
    verbose: false,
    clear: false
}

let copied = 0;
const config = loadConfig(configFile);
const options = Object.assign({}, defaultOptions, config.copy);
if (Array.isArray(options)) {
    options.forEach(o => run(o));
} else if (isObject(options)) {
    run(options);
}

if (options.verbose) {
    console.log('Files copied: ', copied);
}

///////////////////////////////////////////////////////////////////////////////
function loadConfig(fileName) {
    let cfg = {};

    if (fs.existsSync(fileName)) {
        try {
            cfg = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        } catch (e) {
        }
    }

    return cfg;
}

function run(opts = {}) {
    const { destDir, clear, files } = opts;

    if (clear && fs.existsSync(destDir)) {
        fs.rmdirSync(destDir, { recursive: true });
    }
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
    }

    copyFiles(files, opts);
}

function copyFiles(files = [], opts = {}) {
    if (!Array.isArray(files)) {
        return ;
    }

    files.forEach(file => {
        if (typeof file === 'string') {
            let src = path.join(opts.srcDir, file);
            let dest = path.join(opts.destDir, file);

            const fstats = fs.statSync(src);
            if (fstats.isDirectory()) {
                const files = fs.readdirSync(src);
                const mappedFiles = files.map(file => path.join(src, file));
                copyFiles(mappedFiles, Object.assign({}, opts, { files: mappedFiles }));
            } else {
                copyFile(src, dest, opts);
            }
        } else if (isObject(file)) {
            if (file.from) {
                let src = file.from;
                let dest = file.to;
                if (file.exactly !== true) {
                    src = path.join(opts.srcDir, file.from);
                    dest = path.join(opts.destDir, file.to);
                }
                copyFile(src, dest, opts);
            }
        }
    });
}

function copyFile(src, dest, opts = {}) {
    const toDir = path.dirname(dest);
    if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir, { recursive: true });
    }

    fs.copyFileSync(src, dest);
    if (opts.verbose) {
        copied++;
        console.log(src);
    }
}

function isObject(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

module.exports = {
    isObject,
    copyFiles
}