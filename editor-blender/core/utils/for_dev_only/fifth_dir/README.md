template.txt的使用方法：
這個文件是用來複寫新表的，書寫格式如下：

(第一行)//OFF => 不要用template.txt來複寫新表。此時新表為空
如果註解掉(// //OFF)的話則此行失效
除了這行以外，其他所有開頭的"//"的行都不會被讀取
使用如下：
//OFF


Frame：定義新表的frame
pos map跟control map都共用這些frame
有兩種定義方式

- 1. fn
寫出frame的數量，生成frame: [1000, 2000 ... n * 1000]
使用方式舉例如下：
fn
6

-2. f
寫出每個frame的start，根據其生成frame
使用方式舉例如下：
f
1000 4000 5000 7000 9000

fn 跟 f 必須處在p(Pos map)跟c(Control map)前面
如果fn 跟 f被同時使用，只有在後面的一方有效


Pos: 定義新表的pos frame
第i行定義了第i個舞者的pos data
有兩種定義方式：

- 1. X 跟 O
X代表無狀態，O代表有狀態
- 2. 數字
數字代表有狀態的frame number *從0開始計數，以下的frame number同理

沒有被指定的data默認都是無狀態

使用方式舉例如下：
p
X O O
1 2 3
以上代表:
(1) 第一個舞者在frame 1, 2 有狀態
(2) 第二個舞者在frame 1, 2, 3有狀態
(3) 若有更多舞者，則他們在任何frame都沒有狀態


Control: 定義新表的control frame
第一行定義了frame的fade_for_new_status
隨後每一個區塊由>起頭
第i個區塊裡面的第j行，定義了第i個舞者的第j個燈的control data
和pos frame相似，有兩種定義方式：

- 1. X 跟 O
fade_for_new_status:
X代表fade_for...=False, O代表fade_for...=True, 默認為False。
fade:
X代表無狀態，O代表有狀態且fade為False，O-代表有狀態且fade為True
- 2. 數字
數字代表有狀態的frame number
若數字後不接著-，代表該data fade=True，否則即為fade=True

沒有被指定的data默認都是無狀態

使用方式舉例如下：
c
O X X O
>
X O- O
>
1 2
0 3-
以上代表:
(1) frame 0, 3的fade_for_new_status為True
(2) 第一個舞者的第一個燈，在frame 1, 2 有狀態，且在frame 1時fade=True
(3) 第二個舞者的第一個燈，在frame 1, 2 有狀態，且皆為fade=False
    他的第二個燈，在frame 0, 3有狀態，且在frame 3 fade=True
(3) 其他舞者跟燈在任何frame都沒有狀態

第一，二位舞者(0_chen跟1_li)的前五個燈
'bottom_skirt'
'collar'
'inner_hat'
'inner_left_arm'
'inner_left_cuff'
第三，四位舞者的前五個燈
'bottom_clothes'
'claw'
'inner_left_arm'
'inner_left_collar'
'inner_left_pants'