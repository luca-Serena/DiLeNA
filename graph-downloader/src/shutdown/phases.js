const MAIN_PROCESS_PHASES = Object.freeze({
    ParsePhase: () => 'Parse',
    DownloadPhase: () => 'Download',
    GenerationPhase: () => 'Generation'
})

const GENERATION_PROCESS_PHASES = Object.freeze({
    SplitPhase: () => 'Split',
    NodesPhase: () => 'Nodes',
    TransactionsPhase: () => 'Transactions',
    ComposeNodesPhase: () => 'Compose Nodes',
    ComposeTransactionsPhase: () => 'Compose Transactions',
    TerminatedPhase: () => 'Terminated'
})

module.exports = {
    MAIN_PROCESS_PHASES,
    GENERATION_PROCESS_PHASES
}
