# Rocket Race

Браузерная игра для 1-4 игроков.

Задача игроков - собрать все контрольные точки, избегая попаданий ракет и их взрывов.

Демо: [http://c0smocat.github.io/rocket-race/](http://c0smocat.github.io/rocket-race/)

## Скриншоты

![Screenshot 1](screenshots/1.png)
![Screenshot 2](screenshots/2.png)
![Screenshot 3](screenshots/3.png)

## Особенности

- Поддержка нескольких игроков (зависит от выбранной карты)
- Несколько уровней, возможно добавление новых
- Интуитивно понятный геймплей
- Босс-битва после сбора всех контрольных точек
- Аудиосопровождение
- Сохранение и просмотр реплеев
- Открытый исходный код

## Управление

- Пауза/меню - `Esc`
- Презапуск уровня - `R`, `Enter`, `Home` или `End`

### Упрощённый режим

| Игрок   | Цвет    | Влево       | Вниз        | Вверх     | Вправо       |
|---------|---------|-------------|-------------|-----------|--------------|
| Игрок 1 | Красный | `A`         | `S`         | `W`       | `D`          |
| Игрок 2 | Синий   | `ArrowLeft` | `ArrowDown` | `ArrowUp` | `ArrowRight` |
| Игрок 3 | Зелёный | `J`         | `K`         | `I`       | `L`          |
| Игрок 4 | Голубой | `Num4`      | `Num5`      | `Num8`    | `Num6`       |

### Ручной режим
| Игрок   | Цвет    | Ускорение | Поворот ↪  | Поворот ↩    |
|---------|---------|-----------|-------------|--------------|
| Игрок 1 | Красный | `W`       | `A`         | `D`          |
| Игрок 2 | Синий   | `ArrowUp` | `ArrowLeft` | `ArrowRight` |
| Игрок 3 | Зелёный | `I`       | `J`         | `L`          |
| Игрок 4 | Голубой | `Num8`    | `Num4`      | `Num6`       |

Сенсорный ввод [пока](#todo) не поддерживается 😢

## TODO
- Опциональное упрощённое управление
- Секундомер вместо очков
- Плавное движение камеры
- Больше анимаций
- Тряска камеры
- Индикатор загрузки аудио + экран начала игры
- Новые уровни с новыми фичами
- Режим выживания
  - Со временем на карте появляются новые пушки 
- Новые виды пушек
  - С несколькими ракетами за выстрел ("дробовик")
  - Со стрельбой очередями
  - Лазерные
  - ???
- Поддержка сенсорного управления
- Поддержка геймпадов
- Поддержка режима низкой производительности (30 обновлений / сек)
- Больше спецэффектов
- Редактор карт
- Сохранение лучшего результата
- TypeScript

## Ресурсы
- Текстуры
  - [Kenney](https://kenney.nl/) ([CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/))
- Аудио
  - [OpenGameArt.Org](https://opengameart.org/)
  - [Freesound](https://freesound.org/)
