function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.imageDownloadQueue = [];
    this.audioDownloadQueue = [];
}

AssetManager.prototype.queueImageDownload = function (path) {
    console.log("Queueing " + path);
    this.imageDownloadQueue.push(path);
}

AssetManager.prototype.queueAudioDownload = function (path) {
    console.log("Queueing " + path);
    this.audioDownloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return this.imageDownloadQueue.length + this.audioDownloadQueue.length === this.successCount + this.errorCount;
}

AssetManager.prototype.downloadAll = function (callback) {
    for (var i = 0; i < this.imageDownloadQueue.length; i++) {
        var img = new Image();
        var that = this;

        var path = this.imageDownloadQueue[i];
        console.log(path);

        img.addEventListener("load", function () {
            console.log("Loaded " + this.src);
            that.successCount++;
            if(that.isDone()) callback();
        });

        img.addEventListener("error", function () {
            console.log("Error loading " + this.src);
            that.errorCount++;
            if (that.isDone()) callback();
        });

        img.src = path;
        this.cache[path] = img;
    }

    for (var i = 0; i < this.audioDownloadQueue.length; i++) {
        var audio = new Audio();
        var that = this;

        var path = this.audioDownloadQueue[i];
        console.log(path);


        audio.addEventListener("loadeddata", function () {
            console.log("Loaded " + this.src);
            that.successCount++;
            if (that.isDone()) callback();
        });

        audio.addEventListener("error", function () {
            console.log("Error loading " + this.src);
            that.errorCount++;
            if (that.isDone()) callback();
        });

        audio.src = path;
        this.cache[path] = audio;
    }
}

AssetManager.prototype.getAsset = function (path) {
    return this.cache[path];
}