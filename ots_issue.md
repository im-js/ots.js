# issue list

* `filter_if_missing` 文档说明反了
* 只要字段存在，`ots-contentmd5` 填任意值都可通过校验
* `column_value` 为 `PlainBuffer` 值，非 `protobuf`
* `CreateTableRequest` 中的 `table_options` 其实为必填字段，不然无法通过验证， `table_options` 参数必填项描述也有误