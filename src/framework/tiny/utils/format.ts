
export function numberFormat(num: number): string {
    const param = { value: '', unit: '' };
    const k = 10000;
    const sizes = ['', '万', '亿', '万亿'];
    let i = 0;
    if (num < k) {
        param.value = Math.round(num).toString();
        param.unit = '';
    } else {
        i = Math.floor(Math.log(num) / Math.log(k));
        param.value = ((num / Math.pow(k, i))).toFixed(2);
        const strs: string[] = param.value.split('.');
        if (strs.length >= 2) {
            strs[1] = strs[1].substr(0, strs[1][1] == '0' ? (strs[1][0] == '0' ? 0 : 1) : 2);
            if (strs[1] != '') param.value = strs[0] + '.' + strs[1];
            else param.value = strs[0];
        }
        param.unit = sizes[i];
    }
    return param.value + param.unit;
}

export function numberFormatWan(num: number): string {
    const param = { value: '', unit: '' };
    const k = 10000;
    const sizes = ['', '万'];
    if (num < k) {
        param.value = Math.round(num).toString();
        param.unit = sizes[0];
    } else {
        const value = num / k;
        if (num % k == 0) {
            param.value = value.toString();
        } else {
            param.value = value.toFixed(2).toString();
        }
        param.unit = sizes[1];
    }
    return param.value + param.unit;
}

export function numberFormatKM(num: number, fixed: number = 2): string {
    const param = { value: '', unit: '' };
    const k = 1000;
    const sizes = ['', 'k', 'm', 'b', 't', 'q', 'w'];
    if (num < k) {
        param.value = Math.round(num).toString();
        param.unit = sizes[0];
    } else {
        const value = num / k;
        if (num % k == 0) {
            param.value = value.toString();
        } else {
            param.value = value.toFixed(fixed).toString();
        }
        param.unit = sizes[1];
    }
    return param.value + param.unit;
}
