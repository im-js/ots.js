# 消息存储示例设计
## 原则
1. 分区键的取值要足够的离散，以确保没有热点分区；
2. 选择合理的分区键，使得并发写的聚集效果更好，减少 `BatchWrite` 操作的数据分散度。

## 场景
数据需求:  
1. 用户通过 userId 拉取自身相关所有会话。
2. 用户通过 自身ID + 对方ID 拉取会话
3. 用户拉取相关群会话

状态统计：  
1. 统计用户消息未读数、点击数等，并可更改阅读、点击状态。

## IM 存储结构设计
**主键设计**  
```javascript
pk: {
    pk: md5(conversationId) // 分区键
    from: userId
    to: groupId
}
```
`conversationId` 生成规则  
* 如果是群聊，则以 `md5(groupId)`，为 `conversationId`.
* 如果是私聊，则以 `from` 与 `to` 做 `asc` 排序后的字符串拼接值，做 `md5`


**属性列可选值**  
```javascript
attr: {
    bool isRead // 已读状态
    bool isClick // 点击状态
    bytes payload // 序列化后的消息体，protobuf 序列化结果
    string messageId // 消息ID，指向消息实体表
}
```



## 站内消息存储结构设计
和聊天最大的区别在于，会存在大量相同的消息体，所以增加一张消息实体表，用于存储实体消息  
```javascript
pk: {
    md5(messageId)
}
attr: {
    bytes payload // 序列化后的消息体，protobuf 序列化结果
}
```

## 参考
1. [表格存储服务在社交应用场景的实践](https://yq.aliyun.com/articles/57252)