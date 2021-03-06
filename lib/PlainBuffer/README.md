## Tag取值
```
tag_header = 0x75 (4byte)
tag_pk = 0x01 (1byte)
tag_attr = 0x02 (1byte)
tag_cell = 0x03 (1byte)
tag_cell_name = 0x04 (1byte)
tag_cell_value = 0x05 (1byte)
tag_cell_op = 0x06 (1byte)
tag_cell_ts = 0x07 (1byte)
tag_delete_marker = 0x08 (1byte)
tag_row_checksum = 0x09 (1byte)
tag_cell_checksum = 0x0A (1byte)
```

## ValueType
```
VT_INTEGER = 0x0 (8byte) // 有点坑啊
VT_DOUBLE = 0x1 (8byte)
VT_BOOLEAN = 0x2
VT_STRING = 0x3
VT_NULL = 0x6
VT_BLOB = 0x7
VT_INF_MIN = 0x9
VT_INF_MAX = 0xa
VT_AUTO_INCREMENT = 0xb
```

## 格式定义
```
plainbuffer = tag_header row1  [row2]  [row3]
row = ( pk [attr] | [pk] attr | pk attr ) [tag_delete_marker] row_checksum;
pk = tag_pk cell_1 [cell_2] [cell_3]
attr  = tag_attr cell1 [cell_2] [cell_3]
cell = tag_cell cell_name [cell_value] [cell_op] [cell_ts] cell_checksum
cell_name = tag_cell_name  formated_value
cell_value = tag_cell_value formated_value
cell_op = tag_cell_op  cell_op_value
cell_ts = tag_cell_ts cell_ts_value
row_checksum = tag_row_checksum row_crc8
cell_checksum = tag_cell_checksum row_crc8
formated_value = value_type value_len value_data
value_type = int8
value_len = int32
cell_op_value = delete_all_version | delete_one_version
cell_ts_value = int64 
delete_all_version = 0x01 (1byte)
delete_one_version = 0x03 (1byte)
```




## 优化路径
* 使用 `write` 写入字符串 30,208 ops/sec
* 替换为 `fill` 写入字符串 39,232 ops/sec
* 


## 帮助文档
[crc 8 实现](http://wuchenxu.com/2015/12/07/CRC8-calculate/)  
[javaSDk 性能优化测试](https://yq.aliyun.com/articles/39695?spm=5176.100239.0.0.JYzeZ5)  
[v8-perf](https://github.com/thlorenz/v8-perf/issues/4)  
[protobuf 解析](https://www.ibm.com/developerworks/cn/linux/l-cn-gpb/)