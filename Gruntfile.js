module.exports = function(grunt) {
	var pkg = grunt.file.readJSON("package.json");
	
	var defaultTasks = [];
	var deployTasks = [];
	var taskCount = 0;
	
	var config = {pkg: pkg};
	
	var load = function(folderOrFiles){
		var _ = grunt.util._;
		var extend = grunt.util._.extend;
		var deepExtend = function(source, extension){
			if(!extension){
				if(!source){
					return {};
				}else{
					return _.clone(source, true);
				}
			}else if(!source){
				if(!extension){
					return {};
				}else{
					return _.clone(extension, true);
				}
			}
			source = _.clone(source, true);
			
			for(var key in extension){
				if(source.hasOwnProperty(key)){
					if(_.isPlainObject(source[key])){
						source[key] = deepExtend(source[key], extension[key]);
					}else{
						source[key] = extension[key];
					}
				}else{
					source[key] = _.clone(extension[key], true);
				}
			}
			
			return source;
		};
		
		var self = this;
		
		this.taskId = "Task" + taskCount++;
		this.target = null;
		this.folder = folderOrFiles;
		this.tasks = null;
		var selfTasks = [];
		
		grunt.registerTask(this.taskId, tasks);
		
		this.run = function(tasks){
			self.tasks = tasks;
			return self;
		};
		
		this.to = function(output){
			self.target = pkg.outputFolder + output;
			return self;
		};
		
		this.jshint = function(cfg){
			var c = deepExtend({}, cfg);
			c.files = {src: self.folder};
			
			if(!config.jshint){
				config.jshint = {};
			}
			config.jshint[self.taskId] = c;
			tasks.push("jshint:" + self.taskId);
			selfTasks.push("jshint:" + self.taskId);
			return self;
		};
		
		this.concat = function(cfg){
			var c = deepExtend({}, cfg);
			c.src = self.folder;
			c.dest = self.target;
			
			if(!config.concat){
				config.concat = {};
			}
			config.concat[self.taskId] = c;
			tasks.push("concat:" + self.taskId);
			selfTasks.push("concat:" + self.taskId);
			return self;
		};
		
		this.uglify = function(cfg){
			var c = deepExtend({options: {preserveComments: "some"}}, cfg);
			c.src = self.target;
			c.dest = self.target;
			
			if(!config.uglify){
				config.uglify = {};
			}
			config.uglify[self.taskId] = c;
			tasks.push("uglify:" + self.taskId);
			selfTasks.push("uglify:" + self.taskId);
			return self;
		};
		this.banner = function(banner, cfg){
			var c = deepExtend({options: {position: "top", banner: banner}}, cfg);
			c.files = {src: self.target};
			
			if(!config.usebanner){
				config.usebanner = {};
			}
			config.usebanner[self.taskId] = c;
			tasks.push("usebanner:" + self.taskId);
			selfTasks.push("usebanner:" + self.taskId);
			return self;
		};
		
		this.compass = function(environment, cfg){
			if(!cfg){
				cfg = {};
			}
			var defaultConfig = {options: {
                    sassDir: 'scss',
                    cssDir: '<%= pkg.outputFolder %>css',
                    imagesDir: '<%= pkg.outputFolder %>img',
                    fontsDir: '<%= pkg.outputFolder %>fonts',
                    environment: 'development',
                    outputStyle: 'expanded',
                    relativeAssets: true,
                    noLineComments: false,
                    debugInfo: true
                }
			};
			if(environment == "production"){
				defaultConfig = deepExtend(defaultConfig, {options: {environment: "production", outputStyle: "compressed", debugInfo: false, noLineComments: true, force: true}});
			}
			
			self.to("css/*.css");
			
			var c = deepExtend(defaultConfig, cfg);
			c.src = self.target;
			c.dest = self.target;
			
			if(!config.compass){
				config.compass = {};
			}
			config.compass[self.taskId] = c;
			tasks.push("compass:" + self.taskId);
			selfTasks.push("compass:" + self.taskId);
			return self;
		};

        this.less = function(debugMode, cfg){
            if(!cfg){
                cfg = {};
            }
            var defaultConfig = {options: {

            }
            };
            if(debugMode){
                defaultConfig = deepExtend(defaultConfig, {
                    options: {
                        dumpLineNumbers: true
                    }
                });
            }else{
                defaultConfig = deepExtend(defaultConfig, {
                    options: {
                        compress: true,
                        yuicompress: true
                    }
                });
            }

            var c = deepExtend(defaultConfig, cfg);
            c.src = self.folder;
            c.dest = self.target;

            if(!config.less){
                config.less = {};
            }
            config.less[self.taskId] = c;
            tasks.push("less:" + self.taskId);
            selfTasks.push("less:" + self.taskId);
            return self;
        };

        this.typescript = function(cfg){
            var c = deepExtend({}, cfg);
            c.src = self.folder;
            c.dest = self.target;

            c.options = {
                sourcemap: false,
                declaration: false
            };

            if(!config.typescript){
                config.typescript = {};
            }
            config.typescript[self.taskId] = c;
            tasks.push("typescript:" + self.taskId);
            selfTasks.push("typescript:" + self.taskId);
            return self;
        };
		
		this.watch = function(cfg){
            if(!cfg){
                cfg = {};
            }

			if(!config.watch){
				config.watch = {};
			}

			var c = deepExtend({files: self.folder, tasks: selfTasks}, cfg);
			
			config.watch[self.taskId] = c;
			return self;
		};
		return self;
	};
	
	 var banner = '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> */';
	
	load("js/app/**/*.js").run(defaultTasks).to("js/app.js").jshint().concat().watch();
	load("js/lib/**/*.js").run(defaultTasks).to("js/lib.js").concat().watch();
	load("less/admin.less").run(defaultTasks).to("css/admin.css").less(true).watch({files: "less/**/*.less"});

	load("js/app/**/*.js").run(deployTasks).to("js/app.js").jshint().concat().uglify().banner(banner);
	load("js/lib/**/*.js").run(deployTasks).to("js/lib.js").concat().uglify();
    load("less/admin.less").run(deployTasks).to("css/admin.css").less(false).banner(banner);
	
	grunt.initConfig(config);
	
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks("grunt-banner");
	grunt.loadNpmTasks("grunt-dart2js");

	grunt.registerTask("default", defaultTasks);
	grunt.registerTask("deploy", deployTasks);
    grunt.registerTask("monitor", ["default", "watch"]);
};