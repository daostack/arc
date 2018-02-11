/**
 * This file contains various templates used to render `.md` files.
 *
 * author: Matan Tsuberi (dev.matan.tsuberi@gmail.com)
 */

/* This is a little trick to make templates more readable.
 * used in templates like :
 * `line1${N
 * }line2`
 * to keep indentation in the code from rendering as indentation in the output.
 * */
const N = '\n';

/**
 * @function contract - renders a contract `.md` file based on information from `solc` compiler.
 * @param file - the file path of the orignial `.sol` file.
 * @param contractName - the name of the compiled contract.
 * @param abi - a obtained from the compiler containing the structure of the exposed contract interface.
 * @param devdoc - a possibally empty({}) object containing `natspec` documentation.
 * @param gas - `gasEstimates` from `solc` that provide an upper bound of the gas usage.
 */
const contract = (file,contractName,abi,devdoc,gas) => {

    const events = abi.filter(x => x.type === 'event').sort((x,y) => x.name <= y.name);
    const functions = abi.filter(x => x.type === 'function').sort((x,y) => x.name <= y.name);
    const constructors = abi.filter(x => x.type === 'constructor').sort((x,y) => x.name <= y.name);
    const fallbacks = abi.filter(x => x.type === 'fallback').sort((x,y) => x.name <= y.name);
    const fallback = fallbacks.length ? fallbacks[0] : null;
    const methods = devdoc.methods || {};

    const gasEstimate = (est) => est ? `less than ${est} gas.` : 'No bound available.';
    const signature = (name,ps) => `${name}(${ps.map(p => `${p.type}`).join(', ')})`;
    const title = (text) => `### ${text}`;
    const functionComment = (obj) => obj.details ? `> ${obj.details.trim()}${N}` : '';
    const paramComment = (obj, name) => obj.params && obj.params[name] ? `- ${obj.params[name]}` : '';

    const modifiers = (fn) =>
        `${N}**${
            [...fn.payable ? ['payable'] : [],
            ...fn.constant ? ['constant'] : [],
            ...fn.stateMutability && !fn.payable ? [fn.stateMutability] : []]
            .join(' | ')}**${N}`;

    const param = (obj,p,i) => `${i+1}. **${p.name || 'unnamed'}** *of type ${p.type}${paramComment(obj,p.name)}*`;
    const params = (obj,title,ps) =>
        `*${title}:*${N}${N
        }${ps.length ? ps.map((p,i) => param(obj,p,i)).join(N) : '*Nothing*'}${N
        }`;

    const constructor = (fn) =>{
        const sign = signature(contractName,fn.inputs);
        const obj = methods[sign] || {};
        return (
        `${title(sign)}${N
        }${functionComment(obj)}${N
        }*Execution cost: **${gasEstimate(gas.external[sign])}***${N
        }${modifiers(fn)}${N
        }${params(obj,'Params',fn.inputs)}${N
        }`);
    };

    const event = (e) =>
        `${title(signature(e.name,e.inputs))}${N
        }${params({},'Params',e.inputs)}${N
        }`;

    const func = (fn) =>{
        const sign = signature(fn.name,fn.inputs);
        const obj = methods[sign] || {};
        return (
        `${title(sign)}${N
        }${functionComment(obj)}${N
        }*Execution cost: **${gasEstimate(gas.external[sign])}***${N
        }${modifiers(fn)}${N
        }${params(obj,'Inputs',fn.inputs)}${N
        }${obj.return ? obj.return : params({},'Returns',fn.outputs)}${N
        }`);
    };

    const fb = (fn) =>{
        const obj = methods[''] || {};
        return (
        `*Execution cost: **${gasEstimate(gas.external[''])}***${N
        }${modifiers(fn)}${N
        }${functionComment(obj)}${N
        }`);
    };

    const description = devdoc.title ? `${devdoc.title.trim()}${N}` : '';

    const res = (
        `# ${contractName}${N
        }[see the source](https://github.com/daostack/arc/tree/master/${file})${N}${N
        }*Code deposit cost: **${gasEstimate(gas.creation[1])}***${N}${N
        }*Execution cost: **${gasEstimate(gas.creation[0])}***${N}${N
        }*Total deploy cost(deposit + execution): **${gasEstimate(gas.creation[0] && gas.creation[1] ? gas.creation[0] + gas.creation[1] : null)}***${N}${N
        }> ${description}${N
        }## Constructors${N
        }${constructors.length ? constructors.map(c => constructor(c)).join(`---${N}`) : '*Nothing*'}${N
        }## Events${N
        }${events.length ? events.map(e => event(e)).join(`---${N}`) : '*Nothing*'}${N
        }## Fallback${N
        }${fallback ? fb(fallback) : '*Nothing*'}${N
        }## Functions${N
        }${functions.length ? functions.map(f => func(f)).join(`---${N}`) : '*Nothing*'}${N
        }`);
    return res;
};

module.exports = {contract};
