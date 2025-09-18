// Основной код игры
var WIDTH = 40 // Ширина карты
var HEIGHT = 24 // Высота карты
var TILE_SIZE = 32 // Размер px

// Глобальные переменные
var map = [] // Карта: 1 = стена, 0 = пол
var hero = { x: 0, y: 0, health: 100, maxHealth: 100, attack: 10 } // Герой
var enemies = [] // Враги
var potions = [] // Зелья
var swords = [] // Мечи
var gameActive = true // Состояние игры

// Инициализация игры
function init() {
	gameActive = true
	generateMap()
	placeItems()
	placeHero()
	placeEnemies()
	render()
}

// Генерация карты
function generateMap() {
	// Заполняем карту стенами
	for (var y = 0; y < HEIGHT; y++) {
		map[y] = []
		for (var x = 0; x < WIDTH; x++) {
			map[y][x] = 1
		}
	}

	// Создаём 5-10 комнат
	var numRooms = Math.floor(Math.random() * 6) + 5
	var rooms = []
	for (var i = 0; i < numRooms; ) {
		var w = Math.floor(Math.random() * 6) + 3
		var h = Math.floor(Math.random() * 6) + 3
		var rx = Math.floor(Math.random() * (WIDTH - w - 1)) + 1
		var ry = Math.floor(Math.random() * (HEIGHT - h - 1)) + 1

		var overlap = false
		for (var j = 0; j < rooms.length; j++) {
			var r = rooms[j]
			if (
				rx < r.x + r.w + 1 &&
				rx + w + 1 > r.x &&
				ry < r.y + r.h + 1 &&
				ry + h + 1 > r.y
			) {
				overlap = true
				break
			}
		}

		if (!overlap) {
			rooms.push({ x: rx, y: ry, w: w, h: h })
			for (var yy = ry; yy < ry + h; yy++) {
				for (var xx = rx; xx < rx + w; xx++) {
					map[yy][xx] = 0
				}
			}
			i++
		}
	}

	// Соединяем комнаты L-образными коридорами
	for (var i = 0; i < rooms.length - 1; i++) {
		var r1 = rooms[i]
		var r2 = rooms[i + 1]
		var cx1 = r1.x + Math.floor(r1.w / 2)
		var cy1 = r1.y + Math.floor(r1.h / 2)
		var cx2 = r2.x + Math.floor(r2.w / 2)
		var cy2 = r2.y + Math.floor(r2.h / 2)

		var minX = Math.min(cx1, cx2)
		var maxX = Math.max(cx1, cx2)
		for (var x = minX; x <= maxX; x++) {
			map[cy1][x] = 0
		}
		var minY = Math.min(cy1, cy2)
		var maxY = Math.max(cy1, cy2)
		for (var y = minY; y <= maxY; y++) {
			map[y][cx2] = 0
		}
	}

	// Добавляем горизонтальные проходы
	var numHor = Math.floor(Math.random() * 3) + 3
	for (var i = 0; i < numHor; i++) {
		var yPos = Math.floor(Math.random() * HEIGHT)
		for (var x = 0; x < WIDTH; x++) {
			map[yPos][x] = 0
		}
	}

	// Добавляем вертикальные проходы
	var numVer = Math.floor(Math.random() * 3) + 3
	for (var i = 0; i < numVer; i++) {
		var xPos = Math.floor(Math.random() * WIDTH)
		for (var y = 0; y < HEIGHT; y++) {
			map[y][xPos] = 0
		}
	}

	// Проверяем связность карты
	var attempts = 0
	while (!isFullyConnected() && attempts < 10) {
		for (var y = 0; y < HEIGHT; y++) {
			map[y] = []
			for (var x = 0; x < WIDTH; x++) {
				map[y][x] = 1
			}
		}
		rooms = []
		for (var i = 0; i < numRooms; ) {
			var w = Math.floor(Math.random() * 6) + 3
			var h = Math.floor(Math.random() * 6) + 3
			var rx = Math.floor(Math.random() * (WIDTH - w - 1)) + 1
			var ry = Math.floor(Math.random() * (HEIGHT - h - 1)) + 1
			var overlap = false
			for (var j = 0; j < rooms.length; j++) {
				var r = rooms[j]
				if (
					rx < r.x + r.w + 1 &&
					rx + w + 1 > r.x &&
					ry < r.y + r.h + 1 &&
					ry + h + 1 > r.y
				) {
					overlap = true
					break
				}
			}
			if (!overlap) {
				rooms.push({ x: rx, y: ry, w: w, h: h })
				for (var yy = ry; yy < ry + h; yy++) {
					for (var xx = rx; xx < rx + w; xx++) {
						map[yy][xx] = 0
					}
				}
				i++
			}
		}
		for (var i = 0; i < rooms.length - 1; i++) {
			var r1 = rooms[i]
			var r2 = rooms[i + 1]
			var cx1 = r1.x + Math.floor(r1.w / 2)
			var cy1 = r1.y + Math.floor(r1.h / 2)
			var cx2 = r2.x + Math.floor(r2.w / 2)
			var cy2 = r2.y + Math.floor(r2.h / 2)
			var minX = Math.min(cx1, cx2)
			var maxX = Math.max(cx1, cx2)
			for (var x = minX; x <= maxX; x++) {
				map[cy1][x] = 0
			}
			var minY = Math.min(cy1, cy2)
			var maxY = Math.max(cy1, cy2)
			for (var y = minY; y <= maxY; y++) {
				map[y][cx2] = 0
			}
		}
		for (var i = 0; i < numHor; i++) {
			var yPos = Math.floor(Math.random() * HEIGHT)
			for (var x = 0; x < WIDTH; x++) {
				map[yPos][x] = 0
			}
		}
		for (var i = 0; i < numVer; i++) {
			var xPos = Math.floor(Math.random() * WIDTH)
			for (var y = 0; y < HEIGHT; y++) {
				map[y][xPos] = 0
			}
		}
		attempts++
	}
	if (attempts >= 10) {
		console.warn('Предупреждение: карта может быть несвязной.')
	}
}

// Проверка связности карты
function isFullyConnected() {
	var startX = -1,
		startY = -1
	for (var y = 0; y < HEIGHT; y++) {
		for (var x = 0; x < WIDTH; x++) {
			if (map[y][x] === 0) {
				startX = x
				startY = y
				break
			}
		}
		if (startX !== -1) break
	}
	if (startX === -1) return true

	var visited = []
	for (var y = 0; y < HEIGHT; y++) {
		visited[y] = []
		for (var x = 0; x < WIDTH; x++) {
			visited[y][x] = false
		}
	}

	var queue = [{ x: startX, y: startY }]
	visited[startY][startX] = true
	var reachableCount = 1
	var totalFloors = 0
	for (var y = 0; y < HEIGHT; y++) {
		for (var x = 0; x < WIDTH; x++) {
			if (map[y][x] === 0) totalFloors++
		}
	}

	var dirs = [
		[0, -1],
		[0, 1],
		[-1, 0],
		[1, 0],
	]
	while (queue.length > 0) {
		var curr = queue.shift()
		dirs.forEach(function (dir) {
			var nx = curr.x + dir[0]
			var ny = curr.y + dir[1]
			if (
				nx >= 0 &&
				nx < WIDTH &&
				ny >= 0 &&
				ny < HEIGHT &&
				map[ny][nx] === 0 &&
				!visited[ny][nx]
			) {
				visited[ny][nx] = true
				queue.push({ x: nx, y: ny })
				reachableCount++
			}
		})
	}
	return reachableCount === totalFloors
}

// Размещение зелий и мечей
function placeItems() {
	potions = []
	swords = []
	placeMultipleItems(10, potions, function (x, y) {
		return map[y][x] === 0
	})
	placeMultipleItems(2, swords, function (x, y) {
		return map[y][x] === 0 && !isOccupied(x, y, potions)
	})
}

// Размещение объектов
function placeMultipleItems(count, items, isValid) {
	for (var i = 0; i < count; i++) {
		var x, y
		do {
			x = Math.floor(Math.random() * WIDTH)
			y = Math.floor(Math.random() * HEIGHT)
		} while (!isValid(x, y))
		items.push({ x: x, y: y })
	}
}

// Проверка занятости клетки
function isOccupied(tx, ty, items) {
	return items.some(function (item) {
		return item.x === tx && item.y === ty
	})
}

// Размещение героя
function placeHero() {
	var hx, hy
	do {
		hx = Math.floor(Math.random() * WIDTH)
		hy = Math.floor(Math.random() * HEIGHT)
	} while (
		map[hy][hx] !== 0 ||
		isOccupied(hx, hy, potions) ||
		isOccupied(hx, hy, swords)
	)
	hero.x = hx
	hero.y = hy
}

// Размещение врагов
function placeEnemies() {
	enemies = []
	placeMultipleItems(10, enemies, function (x, y) {
		return (
			map[y][x] === 0 &&
			!isOccupied(x, y, potions.concat(swords)) &&
			!(x === hero.x && y === hero.y)
		)
	})
	enemies.forEach(function (enemy) {
		enemy.health = 50
		enemy.maxHealth = 50
		enemy.attack = 5
	})
}

// Отрисовка карты
function render() {
	$('.field').empty()
	for (var y = 0; y < HEIGHT; y++) {
		for (var x = 0; x < WIDTH; x++) {
			var tile = $('<div class="tile"></div>').css({
				left: x * TILE_SIZE + 'px',
				top: y * TILE_SIZE + 'px',
			})

			if (map[y][x] === 1) {
				tile.addClass('wall')
			} else {
				tile.addClass('floor')
			}

			potions.forEach(function (p) {
				if (p.x === x && p.y === y) {
					tile.addClass('potion')
				}
			})

			swords.forEach(function (s) {
				if (s.x === x && s.y === y) {
					tile.addClass('sword')
				}
			})

			if (hero.x === x && hero.y === y) {
				tile.addClass('hero')
				var heroHealth = $(
					'<div class="health" style="width: ' +
						(hero.health / hero.maxHealth) * 100 +
						'%;"></div>'
				)
				tile.append(heroHealth)
			}

			enemies.forEach(function (enemy) {
				if (enemy.x === x && y === enemy.y) {
					tile.addClass('enemy')
					var enemyHealth = $(
						'<div class="health enemy-health" style="width: ' +
							(enemy.health / enemy.maxHealth) * 100 +
							'%;"></div>'
					)
					tile.append(enemyHealth)
				}
			})

			$('.field').append(tile)
		}
	}

	if (enemies.length === 0 && gameActive) {
		$('.win').show()
		gameActive = false
	}
}

// Управление клавишами
function bindKeys() {
	$(document).keydown(function (e) {
		if (!gameActive) return
		var dx = 0,
			dy = 0
		switch (e.which) {
			case 87:
				dy = -1
				break // W
			case 65:
				dx = -1
				break // A
			case 83:
				dy = 1
				break // S
			case 68:
				dx = 1
				break // D
			case 32:
				heroAttack()
				enemyTurn()
				return false // Пробел
		}
		if (dx || dy) {
			moveHero(dx, dy)
			enemyTurn()
		}
		e.preventDefault()
	})
}

// Движение героя
function moveHero(dx, dy) {
	var nx = hero.x + dx
	var ny = hero.y + dy
	var wrapped = false

	console.log(
		'Попытка движения: dx=' +
			dx +
			', dy=' +
			dy +
			', с (' +
			hero.x +
			',' +
			hero.y +
			') на (' +
			nx +
			',' +
			ny +
			')'
	)

	if (nx < 0) {
		nx = WIDTH - 1
		wrapped = true
		console.log('Телепорт влево на x=' + nx)
	} else if (nx >= WIDTH) {
		nx = 0
		wrapped = true
		console.log('Телепорт вправо на x=' + nx)
	}
	if (ny < 0) {
		ny = HEIGHT - 1
		wrapped = true
		console.log('Телепорт вверх на y=' + ny)
	} else if (ny >= HEIGHT) {
		ny = 0
		wrapped = true
		console.log('Телепорт вниз на y=' + ny)
	}

	if ((nx < 0 || nx >= WIDTH || ny < 0 || ny >= HEIGHT) && !wrapped) {
		console.log('Движение заблокировано: выход за границы')
		return
	}
	if (map[ny][nx] === 1) {
		console.log('Движение заблокировано: стена на (' + nx + ',' + ny + ')')
		return
	}
	if (isEnemyAt(nx, ny)) {
		console.log('Движение заблокировано: враг на (' + nx + ',' + ny + ')')
		return
	}

	for (var i = potions.length - 1; i >= 0; i--) {
		if (potions[i].x === nx && potions[i].y === ny) {
			hero.health = Math.min(hero.maxHealth, hero.health + 20)
			potions.splice(i, 1)
			console.log(
				'Подобрано зелье на (' + nx + ',' + ny + '), здоровье=' + hero.health
			)
			break
		}
	}
	for (var i = swords.length - 1; i >= 0; i--) {
		if (swords[i].x === nx && swords[i].y === ny) {
			hero.attack += 5
			swords.splice(i, 1)
			console.log(
				'Подобран меч на (' + nx + ',' + ny + '), атака=' + hero.attack
			)
			break
		}
	}

	hero.x = nx
	hero.y = ny
	console.log('Герой переместился на (' + nx + ',' + ny + ')')
	render()
}

// Атака героя
function heroAttack() {
	var dirs = [
		[0, -1],
		[0, 1],
		[-1, 0],
		[1, 0],
		[-1, -1],
		[-1, 1],
		[1, -1],
		[1, 1],
	] // 8 направлений
	for (var i = enemies.length - 1; i >= 0; i--) {
		var enemy = enemies[i]
		var isAdjacent = dirs.some(function (d) {
			return enemy.x === hero.x + d[0] && enemy.y === hero.y + d[1]
		})
		if (isAdjacent) {
			enemy.health -= hero.attack
			console.log(
				'Атака врага на (' +
					enemy.x +
					',' +
					enemy.y +
					'), здоровье=' +
					enemy.health
			)
			if (enemy.health <= 0) {
				enemies.splice(i, 1)
				console.log('Враг убит на (' + enemy.x + ',' + enemy.y + ')')
			}
		}
	}
	render()
}

// Ход врагов
function enemyTurn() {
	for (var i = enemies.length - 1; i >= 0; i--) {
		var enemy = enemies[i]
		var ex = Math.abs(enemy.x - hero.x)
		var ey = Math.abs(enemy.y - hero.y)
		if (ex + ey === 1) {
			hero.health -= enemy.attack
			console.log(
				'Враг на (' +
					enemy.x +
					',' +
					enemy.y +
					') атаковал героя, здоровье героя=' +
					hero.health
			)
			if (hero.health <= 0) {
				$('.game-over').show()
				gameActive = false
				return
			}
		}
	}

	enemies.sort(function () {
		return Math.random() - 0.5
	})

	var dirs = [
		[0, -1],
		[0, 1],
		[-1, 0],
		[1, 0],
	]
	for (var i = 0; i < enemies.length; i++) {
		var enemy = enemies[i]
		var bestDir = null
		var minDist = Infinity
		dirs.forEach(function (dir) {
			var nx = enemy.x + dir[0]
			var ny = enemy.y + dir[1]
			if (
				nx >= 0 &&
				nx < WIDTH &&
				ny >= 0 &&
				ny < HEIGHT &&
				map[ny][nx] === 0 &&
				!isEnemyAt(nx, ny) &&
				!(nx === hero.x && ny === hero.y)
			) {
				var dist = Math.abs(nx - hero.x) + Math.abs(ny - hero.y)
				if (dist < minDist) {
					minDist = dist
					bestDir = dir
				}
			}
		})
		if (bestDir) {
			enemy.x += bestDir[0]
			enemy.y += bestDir[1]
			console.log('Враг переместился на (' + enemy.x + ',' + enemy.y + ')')
		}
	}
	render()
}

// Проверка наличия врага
function isEnemyAt(tx, ty) {
	return enemies.some(function (enemy) {
		return enemy.x === tx && enemy.y === ty
	})
}

// Перезапуск игры
function restart() {
	$('.game-over').hide()
	$('.win').hide()
	hero.health = hero.maxHealth
	hero.attack = 10
	init()
}

// Запуск игры
$(document).ready(function () {
	init()
	bindKeys()
})
