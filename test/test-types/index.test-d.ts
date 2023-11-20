import { expectType, expectError } from 'tsd'
import { Transform } from 'node:stream'
import { mergeCoverageReportFilesStream, mergeCoverageReportFiles } from '../../index'

expectType<Promise<string>>(mergeCoverageReportFiles(['a', 'b'], {pattern: 'a'}))
expectType<Transform>(mergeCoverageReportFilesStream(['a', 'b'], {pattern: 'a'}))
expectType<Transform>(mergeCoverageReportFilesStream({pattern: 'a'}))

expectError(mergeCoverageReportFiles(['a', 'b'], {pattern: 1}))
expectError(mergeCoverageReportFiles(['a', 'b']))
