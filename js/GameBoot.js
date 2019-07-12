/* global MainGameContainer */
var MainGameContainer = {};

MainGameContainer.GameBoot = function (game) {};

MainGameContainer.GameBoot.prototype = {
  gameAssets: {
    images: [
      { name: 'preloaderBackground', src: './assets/img/preloadbck.png' },
      { name: 'preloaderBar', src: './assets/img/preloadbar.png' },
    ],
    sounds: [],
    music: [],
  },
  preload: function() {
    // load assets
    
    // load image assets
    var x = 0;
    var imagesn = this.gameAssets.images.length;
    
    for (x=0; x<imagesn; x++) {
      this.load.image(
        this.gameAssets.images[x].name,
        this.gameAssets.images[x].src
      );
    }
    
    // load music assets
    var x = 0;
    var soundsn = this.gameAssets.music.length;
    for (x=0; x<soundsn; x++) {
      this.load.audio(
        this.gameAssets.music[x].name,
        this.gameAssets.music[x].src
      );
    }
    
    // load sounds assets
    var x = 0;
    var soundsn = this.gameAssets.sounds.length;
    for (x=0; x<soundsn; x++) {
      this.load.audio(
        this.gameAssets.sounds[x].name,
        this.gameAssets.sounds[x].src
      );
    }
  },
  create: function() {
    this.game.stage.backgroundColor = gameConfig.mainBackgroundColor;
    
    // start game and configure extra things
    
    // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignVertically = true;
    this.scale.pageAlignHorizontally = true;
    this.scale.setShowAll();
    this.scale.refresh();

    this.state.start('GameLoadingScreen');
    
    // window.addEventListener('resize', this.resize(this.game));
    // this.resize(this.game);
  },
  resize: function (game) {
    var canvas = game.canvas;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var wratio = width / height;
    var ratio = canvas.width / canvas.height;
 
    if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
    } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
    }
  }
}
