import globalState from '../core/globalstate'

export const debug = (level) => {
    globalState.setProfilingLevel(level)
}
