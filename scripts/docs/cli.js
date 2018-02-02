/**
 * This is a cli program to automate documentation.
 * run with --help to view available commands.
 * it uses:
 *   - `shelljs` to do some general file system commands.
 *   - `yargs` for argument parsing.
 *
 * author: Matan Tsuberi (dev.matan.tsuberi@gmail.com)
 */

const {compile,render} = require('./generate.js');
const templates = require('./templates.js');
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const build_dir = '.docs_build';
const docs_dir = 'docs';

// ---- start helpers

const print = (o) =>
    typeof o === 'string' ?
        shell.echo(o)
    :
        shell.echo(JSON.stringify(o,undefined,2));

// execute a shell command and exit gracefully if fails.
const exec = (argv,cmd) => {
    const code = shell.exec(cmd).code;
    if(code !== 0){
        print(`Command: '${cmd}' exited with code ${code}!`);
        clean(argv,code);
    }
};

// check if `mkdocs` is available.
const isMkDocsAvailable = () => fs.existsSync('mkdocs.yml') && shell.exec('mkdocs --version',{silent:true}).code === 0;

// prints an error message and quits of `mkdocs` not available.
const requireMkdocs = (argv) => {
    if(!isMkDocsAvailable()){
        print('Error: `mkdocs` is not installed.');
        print('Please install:');
        print('1. `mkdocs` according to http://www.mkdocs.org/#installation');
        print('2. `mkdocs-material` according to https://github.com/squidfunk/mkdocs-material');
        clean(argv,1);
    }
};

/*
 * THIS IS A HACK
 * until https://github.com/mkdocs/mkdocs/issues/1399 is solved,
 * `mkdocs` cli does not support the `docs_dir` option.
 * this function sets the `docs_dir` directly in the config file `mkdocs.yml`!.
 */
const setDocsDir = (dir) => {
    const regex = new RegExp('docs_dir:(.*)\\n');
    const text = fs.readFileSync('mkdocs.yml','utf-8');
    const newText = text.replace(regex,`docs_dir: ${dir}\n`);
    fs.writeFileSync('mkdocs.yml',newText,'utf-8');
};

// ---- end helpers

/**
 * @description restores everything to a fresh state and exits with code.
 * @param {*} argv - argument vector from `yargs`
 * @param {*} code - exit code to exit with.
 */
const clean = (argv,code = 0) => {
    print('Cleaning...');
    shell.rm('-rf',argv.sitedir,build_dir);
    setDocsDir(docs_dir);
    shell.exit(code);
};

/**
 * @description updates the generated documentation from the `.sol` files in `argv.input`,
 * outputs files to `argv.output`, includes headers in `argv.headers`.
 * also prepares the `build_dir` for `mkdocs` usage by renaming all `README.md` to `index.md`,
 * and removing `argv.headers` from the `build_dir` if exists.
 * @param {*} argv - argument vector from `yargs`
 */
const update = (argv) => {
    try{
        shell.rm('-rf',argv.output);
        shell.mkdir(argv.output);
        shell.cp('-rf',argv.headers+'/*',argv.output);
        const files = shell.find(argv.input).filter(x => path.extname(x) === '.sol');
        print(`Compiling ${files.length} files from ${argv.input} ...`);
        const output = compile(files);
        print(`Rendering ${output.length} contracts to ${argv.output} using headers from ${argv.headers}...`);
        const destFn = (file,name) => file.replace(argv.input,argv.output).replace(path.basename(file),`${name}.md`);
        const headerFn = (file,name) => file.replace(argv.input,argv.headers).replace(path.basename(file),`${name}.md`);

        render(output,destFn,headerFn,templates.contract,null);

        // prepare .docs_build/docs for mkdocs.
        shell.mkdir('-p',build_dir);
        shell.cp('-rf',docs_dir,build_dir);
        shell.rm('-rf',`${build_dir}/${argv.headers}`); //remove headers folder
        shell.find(build_dir) // rename README.md to index.md for mkdocs.
            .filter(x => path.basename(x).toLowerCase() === 'readme.md')
            .forEach(f => fs.rename(f,f.replace(path.basename(f),'index.md')));
    }
    catch(e){
        shell.echo(`An error occurred`);
        shell.echo(e.stack);
        clean(argv,1);
    }
};

/**
 * @description updates docs and builds the website to `argv.sitedir`
 * @param {*} argv - argument vector from `yargs`
 */
const build = (argv) => {
    update(argv);
    requireMkdocs(argv);
    setDocsDir(`${build_dir}/${docs_dir}`); // set `docs_dir` in config to `build_dir/docs_dir`
    exec(argv,'mkdocs build --site-dir ' + argv.sitedir); // build the website
    setDocsDir(docs_dir); // set `docs_dir` in config back to `docs_dir`
};

/**
 * @description updates docs and deploys the website to branch `gh-pages` on the remote repo.
 * @param {*} argv - argument vector from `yargs`
 */
const deploy = (argv) => {
    update(argv);
    requireMkdocs(argv);
    setDocsDir(`${build_dir}/${docs_dir}`); // set `docs_dir` in config to `build_dir/docs_dir`
    exec(argv,'mkdocs gh-deploy --force');
    setDocsDir(docs_dir); // set `docs_dir` in config back to `docs_dir`
    clean(argv);
};

/**
 * @description starts a dev server to preview your work while editing docs.
 * Note: in the final website, all `README.md` will be renamed to `index.md` and `argv.headers` will be deleted.
 * @param {*} argv - argument vector from `yargs`
 */
const serve = (argv) => {
    update(argv);
    requireMkdocs(argv);
    setDocsDir(docs_dir);
    exec(argv,'mkdocs serve');
};

/*
 * parse args and execute relevant command.
 */
yargs
    .command('clean', 'Remove any build artifacts that should not be commited to the repo.', (cmd) => cmd, clean)
    .command('deploy', 'Update & push docs website to `gh-pages` branch in the remote repo.', (cmd) => cmd, deploy)
    .command('preview', 'Start a dev-server locally to preview the website while editing. Note: this is not the final website.', (cmd) => cmd, serve)
    .command('update', 'Render `.md` files to `output` from `.sol` files in `input`, include files from `headers` in the template.', (cmd) => cmd, update)
    .command('build', 'Update docs & build the docs website to `sitedir`', (cmd) => cmd, build)
    .option('input', {
        alias: 'i',
        describe: 'Directory to take `.sol` files from while generating docs.',
        default: 'contracts'
    })
    .option('output', {
        alias: 'o',
        describe: 'Directory to output generated docs.',
        default: 'docs/generated_docs'
    })
    .option('headers', {
        alias: 'h',
        describe: 'Directory of `.md` files to be included in generate docs.',
        default: 'docs/contracts'
    })
    .option('sitedir', {
        alias: 's',
        describe: 'Directory to output the documentation website.',
        default: 'site'
    }).argv;
