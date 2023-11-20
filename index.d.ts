import { Transform } from 'node:stream'

type ConfigurationPojo = {
  pattern: string
  outFile?: string
  prependSourceFiles?: boolean
  prependPathFix?: string
  legacyTempFile?: boolean
  ignore?: string[]
}

export function mergeCoverageReportFiles(filePaths: string[], options: ConfigurationPojo): Promise<string>

export function mergeCoverageReportFilesStream(filePathsOrMergeOptions: string[] | ConfigurationPojo, mergeOptions?: ConfigurationPojo): Transform
