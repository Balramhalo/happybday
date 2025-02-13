(function (window) {
    function random(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function bezier(cp, t) {
        var p1 = cp[0].mul((1 - t) * (1 - t));
        var p2 = cp[1].mul(2 * t * (1 - t));
        var p3 = cp[2].mul(t * t);
        return p1.add(p2).add(p3);
    }

    function inheart(x, y, r) {
        var z = ((x / r) ** 2 + (y / r) ** 2 - 1) ** 3 - (x / r) ** 2 * (y / r) ** 3;
        return z < 0;
    }

    function Point(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Point.prototype = {
        clone: function () {
            return new Point(this.x, this.y);
        },
        add: function (o) {
            var p = this.clone();
            p.x += o.x;
            p.y += o.y;
            return p;
        },
        sub: function (o) {
            var p = this.clone();
            p.x -= o.x;
            p.y -= o.y;
            return p;
        },
        div: function (n) {
            var p = this.clone();
            p.x /= n;
            p.y /= n;
            return p;
        },
        mul: function (n) {
            var p = this.clone();
            p.x *= n;
            p.y *= n;
            return p;
        }
    };

    function Heart() {
        var points = [], x, y, t;
        for (var i = 10; i < 30; i += 0.2) {
            t = i / Math.PI;
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            points.push(new Point(x, y));
        }
        this.points = points;
        this.length = points.length;
    }
    Heart.prototype = {
        get: function (i, scale) {
            return this.points[i].mul(scale || 1);
        }
    };

    function Seed(tree, point, scale, color) {
        this.tree = tree;
        this.heart = {
            point: point,
            scale: scale || 1,
            color: color || '#FFC0CB',
            figure: new Heart(),
        };
        this.circle = {
            point: point,
            scale: scale,
            color: color,
            radius: 5,
        };
    }
    Seed.prototype = {
        draw: function () {
            this.drawHeart();
            this.drawText();
        },
        drawHeart: function () {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, scale = heart.scale;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < heart.figure.length; i++) {
                var p = heart.figure.get(i, scale);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawText: function () {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, scale = heart.scale;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.font = "12px Verdana";
            ctx.fillText("Happy Birthday!", 10, 0);
            ctx.restore();
        }
    };

    function Tree(canvas, width, height) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.initSeed();
        this.initBloom();
    }
    Tree.prototype = {
        initSeed: function () {
            var x = this.width / 2;
            var y = this.height / 2;
            this.seed = new Seed(this, new Point(x, y), 1, '#FF0000');
        },
        initBloom: function () {
            var num = 500, width = this.width, height = this.height, figure = this.seed.heart.figure;
            var r = 240, cache = [];
            for (var i = 0; i < num; i++) {
                cache.push(this.createBloom(width, height, r, figure));
            }
            this.blooms = cache;
        },
        createBloom: function (width, height, radius, figure) {
            var x, y;
            while (true) {
                x = random(20, width - 20);
                y = random(20, height - 20);
                if (inheart(x - width / 2, height - (height - 40) / 2 - y, radius)) {
                    return new Point(x, y);
                }
            }
        },
        draw: function () {
            this.seed.draw();
            var ctx = this.ctx;
            ctx.fillStyle = "#FF69B4";
            this.blooms.forEach(function (bloom) {
                ctx.beginPath();
                ctx.arc(bloom.x, bloom.y, 3, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    };

    window.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        var tree = new Tree(canvas, canvas.width, canvas.height);
        tree.draw();
    };
})(window);