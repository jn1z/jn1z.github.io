'use strict';
const EMPTY = 0;

// Object to track the last move of each color
let lastMoves = {};

let lastPlayerWhoMoved = 0;

// Function to check 8-connected adjacency
function isAdjacent(x, y, lastX, lastY) {
    return Math.abs(x - lastX) <= 1 && Math.abs(y - lastY) <= 1;
}

function _position_outside_board(position, num_rows, num_cols) {
    var x = position[0];
    var y = position[1];
    return (x < 1 || x > num_cols || y < 1 || y > num_rows);
}

function hasLegalMove(color, board) {
    if (!lastMoves[color]) {
        // If the player hasn't made a move yet, assume they have legal moves.
        return true;
    }

    let [lastX, lastY] = lastMoves[color];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let newX = lastX + dx;
            let newY = lastY + dy;
            // Check if the new position is within the board and is empty
            if (!_position_outside_board(newX, newY) && board[[newX,newY]] === EMPTY) {
                return true;
            }
        }
    }
    console.log("Player does not have a legal move");
    return false;
}

function isGameOver(board, allPlayers, player_can_move) {
    let total_legal_players = 0;
    for (let color=1; color <= allPlayers; color++) {
        if (player_can_move[color] && hasLegalMove(color, board)) {
            total_legal_players += 1;
        } else {
            player_can_move[color] = false;
        }
    }
    return total_legal_players <= 1;
}

function _reset(num_rows, num_cols, value) {
    var array = {};
    for (var row = 1; row <= num_rows; row++) {
        for (var col = 1; col <= num_cols; col++) {
            array[[row, col]] = value;
        }
    }
    return array;
}


Vue.component('stone-shadow', {
    props: ['cx', 'cy'],
    template: `<g>
                 <circle :cx="cx" :cy="cy" r="12" fill="black" :fill-opacity="0.2"/>
               </g>`
})


Vue.component('stone', {
    props: ['cx', 'cy', 'fill'],
    template: `<g>
                 <circle :cx="cx" :cy="cy" r="12" :fill="fill" />
               </g>`
})


Vue.component('board-corner', {
    props: ['rotate'],
    template: `<g :transform="rotate">
                 <rect x="14.0"
                       y="15.0"
                       width="2.0"
                       height="15.0"
                       fill="#533939" />
                 <rect x="14.0"
                       y="14.0"
                       width="16.0"
                       height="2.0"
                       fill="#533939" />
               </g>`
})


Vue.component('board-edge', {
    props: ['rotate'],
    template: `<g :transform="rotate">
                 <rect x="14.5"
                       y="15.0"
                       width="1.0"
                       height="15.0"
                       fill="#533939" />
                 <rect x="0.0"
                       y="14.0"
                       width="30.0"
                       height="2.0"
                       fill="#533939" />
               </g>`
})


Vue.component('board-any', {
    template: `<g>
                 <rect x="14.5"
                       y="0.0"
                       width="1.0"
                       height="30.0"
                       fill="#533939" />
                 <rect x="0.0"
                       y="14.5"
                       width="30.0"
                       height="1.0"
                       fill="#533939" />
               </g>`
})


Vue.component('board-grid', {
    props: ['col', 'row', 'num_cols', 'num_rows'],
    render(createElement) {

        // top left
        if (this.col == 1 && this.row == 1) {
            return createElement('board-corner', {
                props: {
                    rotate: "rotate(0 15 15)"
                }
            });
        }

        // top right
        if (this.col == this.num_cols && this.row == 1) {
            return createElement('board-corner', {
                props: {
                    rotate: "rotate(90 15 15)"
                }
            });
        }

        // bottom left
        if (this.col == 1 && this.row == this.num_rows) {
            return createElement('board-corner', {
                props: {
                    rotate: "rotate(270 15 15)"
                }
            });
        }

        // bottom right
        if (this.col == this.num_cols && this.row == this.num_rows) {
            return createElement('board-corner', {
                props: {
                    rotate: "rotate(180 15 15)"
                }
            });
        }

        // top edge
        if (this.row == 1) {
            return createElement('board-edge', {
                props: {
                    rotate: "rotate(0 15 15)"
                }
            });
        }

        // bottom edge
        if (this.row == this.num_rows) {
            return createElement('board-edge', {
                props: {
                    rotate: "rotate(180 15 15)"
                }
            });
        }

        // left edge
        if (this.col == 1) {
            return createElement('board-edge', {
                props: {
                    rotate: "rotate(270 15 15)"
                }
            });
        }

        // right edge
        if (this.col == this.num_cols) {
            return createElement('board-edge', {
                props: {
                    rotate: "rotate(90 15 15)"
                }
            });
        }

        // somewhere in the middle
        return createElement('board-any');
    }
})


var app = new Vue({
    el: '#app',
    data: {
        board_size: 9,
        num_rows: 9,
        num_cols: 9,
        num_players: 2,
        num_colors: 2,
        score: {
            "1": 0,
            "2": 0
        },
        show_score: false,
        color_current_move: null,
        player_can_move: null,
        board: null,
        shadow_opacity: null, // shows shadows with possible future stone placement when moving the mouse over the board
        num_moves: null,
        prev_moves: null,
    },
    created() {
        this.reset();
    },
    methods: {
        mouse_over: function(x, y) {
            if (lastMoves[this.color_current_move] &&
                isAdjacent(x, y, lastMoves[this.color_current_move][0], lastMoves[this.color_current_move][1])) {
                this.shadow_opacity[[x, y]] = 0.5;
            }
        },
        mouse_out: function(x, y) {
            this.shadow_opacity[[x, y]] = 0.0;
        },
        _switch_player: function() {
            this.color_current_move += 1;
            if (this.color_current_move > this.num_colors) {
                this.color_current_move = 1;
            }
            while (!this.player_can_move[this.color_current_move] || !hasLegalMove(this.color_current_move, this.board)) {
                console.log("No legal moves for " + this.color_current_move + ", skipping turn.");
                this.player_can_move[this.color_current_move] = false;
                this.color_current_move += 1;
                if (this.color_current_move > this.num_colors) {
                    this.color_current_move = 1;
                }
            }
        },
        click: function(x, y) {
            if (this.board[[x, y]] != EMPTY) {
                return;
            }
            if (lastMoves[this.color_current_move] &&
                            !isAdjacent(x, y, lastMoves[this.color_current_move][0], lastMoves[this.color_current_move][1])) {
                // we can only place adjacent to our previous stone
                return;
            }

            this.board[[x, y]] = this.color_current_move;
            lastMoves[this.color_current_move] = [x,y];
            this.score[this.color_current_move] += 1;
            lastPlayerWhoMoved = this.color_current_move;
            this.num_moves += 1;

            if (isGameOver(this.board, this.num_colors, this.player_can_move)) {
                console.log("Game over. Winner is " + lastPlayerWhoMoved);
                const messageElement = document.getElementById('winningMessage');
                messageElement.style.display = 'flex';

                // Hide the message after 2.5 seconds
                setTimeout(function() {
                    messageElement.style.display = 'none';
                }, 2500);
            }

            this._switch_player();
        },
        reset: function() {
            this.num_rows = parseInt(this.board_size);
            this.num_cols = parseInt(this.board_size);
            this.num_colors = parseInt(this.num_players);
            this.score = {};
            this.player_can_move = {};
            for (var color = 1; color <= this.num_colors; color++) {
                this.score[color] = 0;
                this.player_can_move[color] = true;
            }
            this.color_current_move = 1;
            this.board = _reset(this.num_rows, this.num_cols, EMPTY);
            this.shadow_opacity = _reset(this.num_rows, this.num_cols, 0.0);
            this.num_moves = 1;
            lastMoves = {};
            lastPlayerWhoMoved = 0;
        },
        color: function(n) {
            let colors = ['black', 'white', 'red', 'blue'];
            return colors[n - 1];
        },
        color_opacity: function(n) {
            if (this.player_can_move[n]) {
                return 1.0;
            }
            return 0.2;
        },
    }
})

