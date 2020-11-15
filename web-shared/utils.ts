export abstract class Utils {

  static arrayEquals<T>(a: T[], b: T[]) { return a == b || a.length == b.length && !a.find(a => !b.includes(a)) }
  static arrayFlatten<T>(array: T[][]): T[] { return ([] as T[]).concat.apply([], array) }
  static arrayShuffle<T>(array: T[]): T[] { return array.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value) }
  static arrayUnique<T>(array: T[], indexOf = (value: T, self: T[]) => self.indexOf(value)): T[] { return array.filter((value, index, self) => index == 0 || index == indexOf(value, self)) }
  static arrayUnwrap<T>(value: T | T[]): T { return Array.isArray(value) ? value[0] : value }
  static arrayWrap<T>(value: T | T[]): T[] { return Array.isArray(value) ? value : value == undefined ? undefined : [value] }

  static asyncRetry<F extends () => Promise<any>>(func: F, attempt: number = 1): Promise<ReturnType<F>> {
    return new Promise<ReturnType<F>>((resolve, reject) => func()
      .then(resolve)
      .catch(reason => {
        console.warn(`Retrying in ${ attempt * 30 }s #${ attempt}...`, reason);
        return Utils.asyncWait(attempt * 30000)
          .then(() => Utils.asyncRetry(func, attempt + 1))
          .then(resolve)
          .catch(reject)
      })
    )
  }
  static asyncWait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static dateCompare(value: Date, value2: Date) {
    if (value?.getTime() < value2?.getTime()) return -1;
    if (value?.getTime() > value2?.getTime()) return 1;

    return 0;
  }
  static dateEquals(value: Date, value2: Date) {
    return Utils.dateToString(value) == Utils.dateToString(value2);
  }
  static dateFromString(string: string) {
    if (string == undefined) return undefined;

    let [year, month, day] = (/(\d{4})-(\d{2})-(\d{2})/.exec(string) || []).slice(1);
    let [hours, min, sec] = (/(\d{2}):(\d{2}):(\d{2})/.exec(string) || []).slice(1);

    let result = new Date(year, month - 1, day);
    if (hours || min || sec)  result.setUTCHours(hours || 0, min || 0, sec || 0);
    else                      result.setHours(0, 0, 0);

    return result;
  }
  static dateToday() {
    let date = new Date();
        date.setHours(0, 0, 0);

    return date;
  }
  static dateToString(date: Date) {
    if (date == undefined) return undefined;

    let year = date.getFullYear();
    let month = (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
    let day = (date.getDate() < 10 ? '0' : '') + date.getDate();

    return `${ year }-${ month }-${ day }`;
  }

  // Thanks https://stackoverflow.com/a/11832950
  static numberDecimalPlaces(value: number, places: number = 2) {
    places = Math.pow(10, places); return value && Math.round((value + Number.EPSILON) * places) / places;
  }
  static numberIsNaN(value: number | string): boolean {
    return value == null || value === '' || isNaN(+value);
  }
  static numberParse(value: number | string): number {
    if (typeof value == 'number') return value;
    if (value == undefined) return undefined;
        value = value
          .replace(/,/g, '.')
          .replace(/<.*?>/g, '')
          .match(/[\d.]+/)?.[0]
        ;

    return value && parseFloat(value);
  }
  static numberRange(from: number, to: number): number[] {
    return new Array(to - from + 1).fill(1).map((_, i) => i + from);
  }
  static numberSequence(n: number): number[] {
    return Array.from(Array(n).keys());
  }

  static objectKeys<T>(object: T) { return Object.keys(object).map(key => key as keyof T) }

  // Remove accents, cedilha, etc., while maintaining casing
  // Thanks https://stackoverflow.com/a/37511463
  static stringClean(value: string): string {
    return value?.normalize('NFD')?.replace(/[\u0300-\u036f]/g, '');
  }
  // Deep copy a string to prevent V8 engine from retaining its reference
  // Read more at https://bugs.chromium.org/p/v8/issues/detail?id=2869
  static stringCopy(value: string): string {
    return ` ${ value }`.slice(1);
  }
  static stringIsDate(value: string): boolean {
    return new Date(value).getFullYear() >= 1900;
  }
  static stringIsTime(value: string): boolean {
    return !!value?.match(/^\d\d:\d\d$/)?.length;
  }
  static stringKey(value: string): string {
    return this.stringClean(value.trim().replace(/[\s-]/g, '_').replace(/[,()]/g, '')).toLowerCase();
  }
  // Iterate over all regex matches
  // Thanks https://stackoverflow.com/a/432503
  static*stringMatchAll(value: string, regexp: RegExp): Generator<RegExpMatchArray> {
    let re = new RegExp(regexp, regexp.global ? regexp.flags : regexp.flags + "g");
    let match;

    while (match = re.exec(value))
      yield match;
  }

  /*
  // Convert from plural to singular
  // Read more at https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/sobre-a-formacao-do-plural/13422
  for (let [regex, replace] of [
    [/ãos$/, 'ão'], [/ões$/, 'ão'], [/ães$/, 'ão'],                                 // Palavras terminadas em vogal
    [/nes$/, 'n'], [/res$/, 'r'], [/zes$/, 'z'],                                    // Palavras terminadas em consoante - terminadas em n/r/z
    [/ais$/, 'al'], [/eis$/, 'el'], [/is$/, 'il'], [/ois$/, 'ol'], [/uis$/, 'ul'],  // Palavras terminadas em consoante - terminadas em al/el/il/ol/ul
    [/õe/, 'ão'], [/ns$/, 'm'],
    [/s$/, '']                                                                      // Regra geral - retirar o s
  ] as [RegExp, string][]) if (value != (value = value.replace(regex, replace))) break;
   */
}
