/* global MainGameContainer */
MainGameContainer.GamePlay = function (game) { };

MainGameContainer.GamePlay.prototype = {
  // Game Objects or Groups
  bgMusic: undefined,
  buttons: {
    cursors: undefined,
    jumpButton: undefined,
    startButton: undefined,
    restartButton: undefined,
  },
  ui: {
    timeLabel: undefined,
    scoreLabel: undefined,
    livesLabel: undefined,
    startLabel: undefined,
    restartLabel: undefined,
  },
  sounds: {
    coin: undefined,
  },
  events: {
    throwItems: undefined,
    drawSlash: undefined,
    deleteSlash: undefined,
  },
  gameState: 'preparing',
  mainMenuBackground: undefined,
  timeCount: 0,
  livesCount: 3,
  scoreCount: 0,
  gameLevel: 0,
  slash: [],
  lines: [],
  itemList: [
    'apple',
    'carrot',
    'orange',
    'pear',
    'tomato',
    'bomb'
  ],
  items: undefined,

  preload: function () { },
  shutdown: function () {
    this.game.world.removeAll();
    // reset everything
    this.resetAll();
  },
  create: function () {
    this.game.time.advancedTiming = true;
    // Enable Global Phisics
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    // set game world size
    this.game.world.setBounds(0, 0, 640, 360);

    // BG image
    this.mainMenuBackground = this.add.sprite(0, 0, 'wood_bg');

    // init sounds
    this.initSounds();

    // init ui
    this.addUIElements();

    // init game gravity
    this.game.physics.arcade.gravity.y = 1200;

    // set lives
    this.livesCount = 3;

    // start body Groups
    this.items = this.add.physicsGroup();
    this.itemsCut = this.add.physicsGroup();
    this.items.enableBody = true;
    this.itemsCut.enableBody = true;

    // window.document.getElementById('gameContainer').requestFullscreen();

    // start button
    var style = {
      font: '22px Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    };
    this.buttons.startButton = this.game.add.button(this.game.world.centerX - 85, this.game.world.centerY, 'preloaderBar', this.startGame, this, 2, 1, 0);
    this.ui.startLabel = this.game.add.text(this.game.world.centerX - 25, this.game.world.centerY + 10, 'START', style);

  },
  update: function () {
    this.updateUI();
    var self = this;
    if (self.gameState === 'playing') {
        this.items.forEach(function (item) {
        if (item.input.pointerOver()
          && (self.game.input.activePointer.leftButton.isDown || self.game.input.pointer1.isDown)
          && self.gameState === 'playing') {
            if (item.type === 'bomb') {
              self.sounds.hit.play();
              self.livesCount = 0;
              item.destroy();
              self.gameState = 'gameOver';
              self.gameOverState();
            } else {
              self.itemDestroy(item);
            }
        } else {
          if (item.state === 'spawing' && item.y <= self.game.height - 20) {
            item.state = 'rising';
          }

          if (item.state === 'rising' && item.body.velocity.y <= -5) {
            item.state = 'falling';
          }

          if (item.state === 'falling' && item.y >= self.game.height + 20 && item.type !== 'bomb') {
            self.sounds.hit.play();
            self.livesCount -= 1;
            item.destroy();
          }

          if (self.livesCount <= 0 && self.gameState === 'playing') {
            self.gameState = 'gameOver';
            self.game.physics.arcade.isPaused = true;
            self.gameOverState();
          }
        }
      });

      if (self.livesCount <= 0 && self.gameState === 'playing') {
        self.gameState = 'gameOver';
        self.game.physics.arcade.isPaused = true;
        self.gameOverState();
      }
    }
  },
  itemDestroy(item) {
    this.sounds.smash.play();
    this.scoreCount += 100;

    var parts = this.createSlashedItems(item.type, item.x, item.y);
    this.pushItem(parts[0], 'left');
    this.pushItem(parts[1], 'right');

    this.game.add.tween(parts[1]).to({ alpha: 0, angle: (-180) }, 1000, 'Linear', true).onComplete.add(function() {
      parts[1].destroy();
    }, this);

    this.game.add.tween(parts[0]).to({ alpha: 0, angle: 180 }, 1000, 'Linear', true).onComplete.add(function() {
      parts[0].destroy();
    }, this);
    item.destroy();
  },
  initSlashAnimation() {

  },
  initSounds() {
    this.sounds.coin = this.game.add.audio('coin');
    this.sounds.smash = this.game.add.audio('confirm');
    this.sounds.hit = this.game.add.audio('error');
    this.sounds.mushrom = this.game.add.audio('loadsave');
  },
  startGame() {
    this.buttons.startButton.destroy();
    this.ui.startLabel.visible = false;
    this.gameState = 'playing';

    // game music
    this.bgMusic = this.game.add.audio('blue_beat');
    this.bgMusic.volume = 0.2;
    this.bgMusic.loop = true;
    this.bgMusic.play();

    var self = this;

    // time count for item throw
    this.events.throwItems = self.game.time.events.loop(Phaser.Timer.SECOND * 3, function () {
      if (self.gameState === 'playing') {
        self.throwItems();
      }
    }, self);
    // time count for slash draw
    this.events.drawSlash = self.game.time.events.loop(Phaser.Timer.SECOND / 35, function () {
      if (self.gameState === 'playing') {
        self.drawSlash();
      }
    }, self);
    this.events.deleteSlash = self.game.time.events.loop(Phaser.Timer.SECOND / 25, function () {
      if (self.gameState === 'playing') {
        self.deleteSlash();
      }
    }, self);

    this.throwItems()
  },
  drawSlash() {
    var count = this.slash.length;
    if (this.game.input.activePointer.leftButton.isDown || this.game.input.pointer1.isDown) {
      if (count >= 1) {
        if (this.game.input.x !== this.slash[count - 1].x && this.game.input.y !== this.slash[count - 1].y) {
          this.slash.push({
            x: this.game.input.x,
            y: this.game.input.y
          });

          var count = this.slash.length;
          if (this.slash.length >= 2) {
            var line = this.game.add.graphics(0, 0);

            // make it a red rectangle
            line.lineStyle(5, 0xffffff);
            line.moveTo(this.slash[count - 2].x, this.slash[count - 2].y);

            // draw a line
            line.lineTo(this.slash[count - 1].x, this.slash[count - 1].y);

            this.lines.push(line);
          }
        }
      } else {
        this.slash.push({
          x: this.game.input.x,
          y: this.game.input.y
        });
      }
    }
  },
  deleteSlash() {
    if (this.slash.length >= 1) {
      this.slash.shift();
    }

    if (this.lines.length >= 1) {
      var line = this.lines.shift();
      line.destroy();
    }
  },
  addUIElements() {
    // set text label style
    var style = {
      font: '16px Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    };

    // add labels/texts
    this.ui.scoreLabel = this.game.add.text(150, 5, 'Score:\n' + this.scoreCount, style);
    this.ui.scoreLabel.fixedToCamera = true;
    this.ui.livesLabel = this.game.add.text(300, 5, 'Lives:\n' + this.livesCount, style);
    this.ui.livesLabel.fixedToCamera = true;
  },
  updateUI() {
    this.ui.scoreLabel.setText('Score:\n' + this.scoreCount);
    this.ui.livesLabel.setText('Lives:\n' + this.livesCount);
  },
  pushItem(item, direction) {
    var xVector = 0;
    var yVector = -400;
    if (direction === 'left') {
      xVector = -80;
    } else {
      xVector = 80;
    }

    item.body.velocity.setTo(xVector, yVector);
  },
  throwItems() {
    this.gameLevel += 1;
    var totalItems = 0;

    if (this.gameLevel >= 1 && this.gameLevel <= 3) {
      totalItems = 1;
    } else if (this.gameLevel >= 4 && this.gameLevel <= 6) {
      totalItems = 2;
    } else if (this.gameLevel >= 7 && this.gameLevel <= 9) {
      totalItems = 3;
    } else {
      totalItems = 4;
    }

    var self = this;

    for (var x = 0; x < totalItems; x++) {
      setTimeout(function () {
        var item = self.createItem();
        self.throwItemToAir(item);
      }, (x * 300));
    }
  },
  // iteam creation
  createItem() {
    var xPos = Math.floor((Math.random() * (this.game.width - 50)) + 50);
    var yPos = this.game.height + 100;
    var fruitType = this.itemList[Math.floor((Math.random() * this.itemList.length))];

    var item = this.items.create(xPos, yPos, fruitType);
    item.type = fruitType;
    item.state = 'spawing';
    item.body.setCircle(45);
    item.inputEnabled = true;
    item.anchor.setTo(0.5, 0.5);

    return item;
  },
  createSlashedItems(itemType, x, y) {
    var part1 = this.itemsCut.create(x, y, itemType + '_cut');
    part1.type = itemType + '_cut';
    part1.state = 'falling';
    part1.body.velocity.setTo(0, 0);
    part1.anchor.setTo(0.5, 0.5);

    var part2 = this.itemsCut.create(x, y, itemType + '_cut');
    part2.type = itemType + '_cut';
    part2.state = 'falling';
    part2.body.velocity.setTo(0, 0);
    part2.anchor.setTo(0.5, 0.5);

    return [part1, part2];
  },
  throwItemToAir(item) {
    var xVector = 0;
    var yVector = -1100;
    if (item.x > (this.game.width / 2)) {
      xVector = -80;
    } else {
      xVector = 80;
    }

    item.body.velocity.setTo(xVector, yVector);
  },
  gameOverState() {
    window.console.log('gameOverState');
    var style = {
      font: '22px Arial',
      fill: '#FFFFFF',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    };

    this.buttons.restartButton = this.game.add.button(this.game.world.centerX - 85, this.game.world.centerY, 'preloaderBar', this.restartGame, this, 2, 1, 0);
    this.ui.restartLabel = this.game.add.text(this.game.world.centerX - 45, this.game.world.centerY + 10, 'RESTART', style);
    this.bgMusic.stop();
    this.game.time.events.remove(this.events.drawSlash);
    this.game.time.events.remove(this.events.throwItems);
    this.items.removeAll();
  },
  restartGame() {
    this.buttons.restartButton.destroy();
    this.ui.restartLabel.visible = false;
    this.game.physics.arcade.isPaused = false;
    this.bgMusic.play();
    this.livesCount = 3;
    this.scoreCount = 0;
    this.gameLevel = 0;
    this.gameState = 'playing';

    // time count for item throw
    const self = this;
    this.events.throwItems = self.game.time.events.loop(Phaser.Timer.SECOND * 3, function () {
      if (self.gameState === 'playing') {
        self.throwItems();
      }
    }, self);
    // time count for slash draw
    this.events.drawSlash = self.game.time.events.loop(Phaser.Timer.SECOND / 35, function () {
      if (self.gameState === 'playing') {
        self.drawSlash();
      }
    }, self);

    self.throwItems();
  },
  render() {
    this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
    var self = this;
    this.items.forEach(function (item) {
      // self.game.debug.body(item);
    });

  },
};
