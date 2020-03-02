// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        jumpHeight: 0,
        jumpDuration: 0,
        maxMoveSpeed: 0,
        accel: 0,
        // 辅助形变动作时间
        squashDuration: 0,
 // scoring sound effect resource
        jumpAudio: {
            default: null,
            type: cc.AudioClip
        },
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        this.jumpAction = this.setJumpAction();
        this.node.runAction(this.jumpAction);
        this.accLeft = false;
        this.accRight = false;
        this.xSpeed = 0;
        this.maxX=this.game.node.width/2-this.node.width/2;
        this.minX=-this.game.node.width/2+this.node.width/2;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);   
	 },
	 onDestroy () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },
    start () {

    },
    setJumpAction: function () {
      // 跳跃上升
             var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
             // 下落
             var jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
             // 形变
             var squash = cc.scaleTo(this.squashDuration, 1, 0.6);
             var stretch = cc.scaleTo(this.squashDuration, 1, 1.2);
             var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);
             // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
             var callback = cc.callFunc(this.playJumpSound, this);
             // 不断重复，而且每次完成落地动作后调用回调来播放声音
             return cc.repeatForever(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback));
    },

    playJumpSound: function () {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

	onKeyDown (event) {
        switch(event.keyCode) {
            case cc.macro.KEY.left:
                this.accLeft = true;
                break;
            case cc.macro.KEY.right:
                this.accRight = true;
                break;
        }
    },

    onKeyUp (event) {
        // unset a flag when key released
        switch(event.keyCode) {
            case cc.macro.KEY.left:
                this.accLeft = false;
                break;
            case cc.macro.KEY.right:
                this.accRight = false;
                break;
        }
    },
   update (dt) {
    // 根据当前加速度方向每帧更新速度
           if (this.accLeft) {
               this.xSpeed -= this.accel * dt;
           } else if (this.accRight) {
               this.xSpeed += this.accel * dt;
           }
           // 限制主角的速度不能超过最大值
           if ( Math.abs(this.xSpeed) > this.maxMoveSpeed ) {
               // if speed reach limit, use max speed with current direction
               this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
           }

           // 根据当前速度更新主角的位置
           this.node.x += this.xSpeed * dt;
           if(this.node.x<this.minX){
               this.xSpeed=0;
               this.node.x=this.minX;
           }else if(this.node.x>this.maxX){
                 this.xSpeed=0;
                 this.node.x=this.maxX;
           }
           },
});
