// eslint-disable-next-line @typescript-eslint/ban-types
type DeferredAction = Function;
type DeferredActionID = DeferredAction | string | number;
type DeferredActionTask = {
    readonly startAt: number;
    timer: ReturnType<typeof setTimeout>;
};
const deferredActions = new Map<DeferredActionID, DeferredActionTask>();

/**
 * 延迟调用，如果在延迟期间再次调用，则会取消之前的调用请求
 * @param action 要执行的操作
 * @param durationMs 延迟时间
 * @param maxDelayMs 从第一次请求此操作到最终执行，最大能被推迟多久, 默认没有限制
 * @param id 用于标记相同操作的ID，如果相同ID的操作在延迟期间再次调用，则会取消之前的调用
 * 	- 如果不传`id`，则使用`action`本身作为ID
 */
export function deferred(action: DeferredAction, durationMs: number, maxDelayMs: number = Infinity, id?: DeferredActionID) {
    const uid = id || action;
    let task = deferredActions.get(uid);
    const callback = () => {
        deferredActions.delete(uid); // 这里需要先删除任务再执行，避免任务发生异常导致无法清理
        action();
    };
    if (task) {
        clearTimeout(task.timer);
        const delay = Math.min(durationMs, maxDelayMs - (Date.now() - task.startAt));
        task.timer = setTimeout(callback, delay);
    } else {
        task = {
            startAt: Date.now(),
            timer: setTimeout(callback, durationMs)
        };
        deferredActions.set(uid, task);
    }
}
