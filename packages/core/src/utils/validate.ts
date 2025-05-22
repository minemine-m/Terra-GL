
/**
 * 必填参数校验工具
 * @param value 待校验的值
 * @param paramName 参数名称（用于错误提示）
 * @param customErrorMsg 自定义错误信息（可选）
 * @throws 当值为空时抛出错误
 * @returns 
 */
export function requireParam<T>(
    value: T | undefined | null,
    paramName: string,
    customErrorMsg?: string
): T {
    if (value === undefined || value === null || value === '') {
        throw new Error(
            customErrorMsg || `Parameter "${paramName}" is required but received: ${value}`
        );
    }
    return value;
}
/**
 * 对象属性必填校验（支持深层嵌套）
 * @param obj 待校验对象
 * @param propPath 属性路径（如 'a.b.c'）
 * @param customErrorMsg 自定义错误信息（可选）
 * requireProp({ a: { b: 1 } }, 'a.b') // 返回 1
 * requireProp({}, 'a.b') // 抛出错误
 */
export function requireProp<T>(
    obj: Record<string, any>,
    propPath: string,
    customErrorMsg?: string
): T {
    const pathSegments = propPath.split('.');
    let current: any = obj;

    for (const segment of pathSegments) {
        if (current[segment] === undefined || current[segment] === null) {
            throw new Error(
               customErrorMsg || `Property "${propPath}" is required but missing at path: "${segment}"`
            );
        }
        current = current[segment];
    }

    return current as T;
}