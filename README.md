This is a project I started to learn Javascript and try my hand at full stack development.

It is a 1v1, real-time browser game built using Javascript, CSS and HTML with a large reliance on the Socket.io library. My goal was to create a competitive and fast paced game that would test
players' reactions and quick-thinking whilst minimising the effects of ping. I attempted this minimisation by creating game modes that mostly
involved pitting players against each other in 'time-trial-like'tasks where upon completion, their times would be compared. These tasks occur in quick succession which give the game it's sense
of pace.

The game opens with a reaction test, to see who is allowed to attack first in the next game mode (the Aim Game).

In the Aim Game, each player is given a marker, that can be of either type 'áttack' or 'defend', that they must click as fast as they can. If the attacking player clicks faster than the defender,
then their attack is successful, otherwise the defender successfully defends.
This mode continues for a random even number of turns between 10-20, after which a random game mode is selected.

Currently, there are only 2 random game modes to choose from: Noughts and Crosses and the Type Duel.

Noughts and Crosses is as its name implies, a game of noughts and crosses/tic tac toe. The only twist is that each player only has 2 seconds to make their move. If the timer runs out or a player loses,
the winning player is given health back. If it is a draw, both players are given a smaller amount of health back.

Type Duel is similar to Type Racer. A random sentence is chosen from a sentence bank for both players to type out. The first to type the sentence wins and subsequently casts a 'spell' that deals damage
to the other player and is unavoidable.


STILL IN PROGRESS - Currently doing animations and fine tuning bugs. Still need to make introductory screen where players can queue from.