'use strict';
var vmSim = require('../src/vm-sim');

exports.invoke = (type, item, id) => {
    let scriptName = `$$invoke#${type}.${item}=${id}`,
        cfg = vmSim.loadScriptConfig(scriptName),
        context = cfg.context;

    context.$$THIS_RECORD = {
        recordId: id,
        recordType: type
    };

    return {
        ctx: context,
        exec: (fn, args) => {
            let argsNames = args.map((a, i) => {
                    let param = `$$param${i}`;
                    context[param] = a;
                    return param;
                }),
                params = argsNames.join(','),
                code = `$resul = ${fn} ( ${params} )`;

            context.$resul = null;
            // execute function in context
            vmSim.evalContext(code, context);

            return context.$resul;
        }
    };
};

exports.loadData = ($this, type) => {
    let recType = $this.recordType,
        recId = $this.recordId,
        record = $db(recType).chain().where({internalid: recId}).value();

    if (Array.isArray(record)) {
        record = record[0];
    }
    if (!record) {
        throw nlapiCreateError('SSS_INVALID_ID', `Not found any match to Record "${recType}" with ID: [${recId}].`);
    }

    if (!record.$$sublists) {
        record.$$sublists = {};
    }

    let recSublist = record.$$sublists;
    if (!recSublist[type]) {
        recSublist[type] = [];
    }

    return recSublist[type];
};

exports.get = ($this, subType) => {
    let recType = $this.recordType,
        recId = $this.recordId;
    if (!$this.sublists || !$this.sublists[subType]) {
        throw nlapiCreateError('SSS_INVALID_LINE_ITEM', `No has any item in "${recType}.${subType}" ID: [${recId}]`);
    }
    return $this.sublists[subType];
};

exports.current = ($this, subType, select) => {
    let recType = $this.recordType,
        subList = exports.get($this, subType);

    if (select) {
        if (select.cancel) {
            delete subList.current;
            delete subList.index;
            delete subList.data;
            return null;
        }

        if (select.new) {
            subList.current = {};
            subList.index = -1;
        } else {
            let data = exports.loadData($this, subType);
            subList.current = data[select.index];
            subList.index = select.index;
        }
    }

    if (!subList.current) {
        throw nlapiCreateError('SSS_INVALID_CURRENT_LINE_ITEM', `No current line has selected in "${recType}.${subType}"`);
    } else {
        return subList.current;
    }
};