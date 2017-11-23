export function invariant(check: boolean, message: string, thing?) {
    if (!check)
        throw new Error("[remobx] Invariant failed: " + message + (thing ? ` in '${thing}'` : ""))
}
