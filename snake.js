Page({
  data: {
    score:0,//当前得分
    maxscore:900,//历史最高分
    startx:0,//触摸开始的横坐标
    starty:0,//触摸开始的纵坐标
    endx: 0,//触摸结束的横坐标
    endy:0,//触摸结束的纵坐标
    ground:[],//存储操场的每个方块
    rows:28,//行数
    cols:22,//列数
    snake:[],//蛇
    food:[],//食物
    direction:"",//移动方向
    timer:"",//初始化定时器
    modalHidden:true//modal弹窗是否隐藏
  },
  onLoad: function (options) {
    var maxscore=wx.getStorageSync("maxscore")
    if(!maxscore) maxscore=0
    this.setData({
      maxscore:maxscore
    })
    this.initGround(this.data.rows,this.data.cols)
    this.initSnake(3)
    this.createFood()
    this.move()
  },
  initGround:function(rows,cols){  //初始化操场
    for(var i=0;i<rows;i++){
      var arr=[];
      this.data.ground.push(arr);
      for(var j=0;j<cols;j++){
        this.data.ground[i].push(0)
      }
    }
  },
  initSnake:function(len){  //初始化蛇,蛇的长度是3，宽度是1
    for(var i=0;i<len;i++){
      this.data.ground[0][i]=1
      this.data.snake.push([0,i])
    }
    this.data.ground[this.data.snake[len-1][0]][this.data.snake[len-1][1]]=3
  },
  createFood:function(){//创建食物
    var x = Math.floor(Math.random()*this.data.rows)
    var y = Math.floor(Math.random() * this.data.cols)
    var ground=this.data.ground
    var snake=this.data.snake
    //食物与蛇的位置不能重合
    var len=snake.length
    var x1=snake[0][0],x2=snake[len-1][0]
    var y1=snake[0][1],y2=snake[len-1][1]
    if(x1==x2) {//说明此时蛇处于一行
      while(x==x1) x = Math.floor(Math.random()*this.data.rows)
      while(y<=y2&&y>=y1) y = Math.floor(Math.random() * this.data.cols)
    }else{//说明此时蛇处于一列
      while(x>=x1&&x<=x2) x = Math.floor(Math.random()*this.data.rows)
      while(y==y1) y = Math.floor(Math.random() * this.data.cols)
    }
    ground[x][y]=2
    this.setData({
          ground: ground,
          food: [x, y]
    })
  },
  tapStart:function(e){  //手指触摸开始，确认开始坐标
    this.setData({
      startx:e.touches[0].pageX,
      starty:e.touches[0].pageY
    })
  },
  tapMove:function(e){  //手指触摸移动，确认结束坐标
    this.setData({
      endx:e.touches[0].pageX,
      endy:e.touches[0].pageY
    })
  },
  tapEnd:function(){ //手指触摸结束，确认蛇移动方向
    //获取滑动距离,只有当在游戏区域滑动才有效
    var heng=(this.data.endx>0)?(this.data.endx-this.data.startx):0
    var zong=(this.data.endy>0)?(this.data.endy-this.data.starty):0
    if(Math.abs(heng)>5||Math.abs(zong)>5){//避免因为一些不必要的触摸带来的移动
      var direction="left"
      if( Math.abs(heng)>Math.abs(zong) && heng>0 ) direction="right" //右移
      else if( Math.abs(heng)>Math.abs(zong) && heng>0 ) direction="left" //左移
            else if( Math.abs(heng)<Math.abs(zong) && zong>0 ) direction="bottom" //下移
                 else direction="top" //上移
      switch(direction){//如果移动方向不好恰好和原方向相反，不好移动，忽略
        case "left":
          if(this.data.direction=="right")  return;
        break;
        case "right":
          if(this.data.direction=="left")  return
        break;
        case "top":
          if (this.data.direction == "bottom") return
        break;
        case "bottom":
          if (this.data.direction == "top") return
        break;
      }
      this.setData({
        direction:direction,
        startx:0,
        starty:0,
        endx:0,
        endy:0
      })
    }
  },
  storeScore:function(){  //计分器
    if(this.data.maxscore<this.data.score){
      this.setData({
        maxscore:this.data.score
      })
    }
    wx.setStorageSync("maxscore", this.data.maxscore)
  },
  move: function () {  //移动函数
    var that = this;
    this.data.timer = setInterval(function () {
      that.changeDir(that.data.direction);
    }, 200)//200ms移动一次
  },
  changeDir: function (dir) {
    if(dir){
      var snake = this.data.snake;
      var len = snake.length;
      var snakeHead = snake[len - 1]//蛇头坐标
      var snakeTail = snake[0];//蛇尾坐标
      var ground = this.data.ground;
      ground[snakeTail[0]][snakeTail[1]] = 0;//蛇尾移动，原来被占的地方恢复
      for (var i = 0; i < len - 1; i++) snake[i] = snake[i + 1];
      var x = snakeHead[0], y = snakeHead[1];
      switch (dir) {//求蛇头下一步位置
        case 'left':y--;
        break;
        case 'right':y++;
        break;
        case 'top':x--;
        break;
        case 'bottom':x++;
        break;
      };
      snake[len - 1] = [x, y];//最新的蛇头位置
      this.checkGame(snakeTail);
      for (var i = 0; i < len-1; i++) {
        ground[snake[i][0]][snake[i][1]] = 1;
      }
      ground[snake[len-1][0]][snake[len-1][1]]=3
      this.setData({
        snake: snake,
        ground: ground
      })
    }
  },
  checkGame: function (snakeTAIL){  //游戏状态
    var arr=this.data.snake;
    var len=this.data.snake.length;
    var snakeHEAD=arr[len-1]
    if(snakeHEAD[0]<0||snakeHEAD[0]>=this.data.rows||snakeHEAD[1]<0||snakeHEAD[1]>=this.data.cols){//撞墙
      clearInterval(this.data.timer)
      this.setData({
        modalHidden:false
      })
    }
    for(var i=0;i<len-1;i++){
      if (snakeHEAD[0] == arr[i][0] && snakeHEAD[1] == arr[i][1]) {//蛇身与蛇头相碰
        clearInterval(this.data.timer)
        this.setData({
          modalHidden:false
        })
      }
    }
    if(snakeHEAD[0]==this.data.food[0]&&snakeHEAD[1]==this.data.food[1]){//吃到食物
      arr.unshift(snakeTAIL)
      this.setData({
        score:this.data.score+10
      })
      this.createFood()
      this.storeScore()
    }
  },
  modalConfirm:function(){  //点击确定触发的事件
    this.setData({
      score:0,
      ground:[],
      snake:[],
      food:[],
      modalHidden:true,
      direction:""
    })
    this.onLoad()
  }
})