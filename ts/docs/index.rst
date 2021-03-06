TrueSkill
=========

Bayesian skill rating system

.. currentmodule:: trueskill

What's TrueSkill?
~~~~~~~~~~~~~~~~~

TrueSkill_ is a rating system among game players. It has been used on `Xbox
Live`_ to rank and match players.

This system quantizes players' **TRUE** skill points by a Bayesian inference
algorithm and it makes to easy to find the best match between a matchmaking
pool. It also works well with any type of match rule including N:N team game
or deathmatch.

This project is a Python package which implements the TrueSkill rating system.

.. _TrueSkill: http://research.microsoft.com/en-us/projects/trueskill
.. _Xbox Live: http://www.xbox.com/live

Installing
~~~~~~~~~~

The package is available in `PyPI <http://pypi.python.org/pypi/trueskill>`_. To
install it in your system, use :command:`easy_install`:

.. sourcecode:: bash

   $ easy_install trueskill

Or check out developement version:

.. sourcecode:: bash

   $ git clone git://github.com/sublee/trueskill.git

Learning
~~~~~~~~

Rating, a model for player's skill
----------------------------------

In TrueSkill, rating is a Gaussian distribution which starts from
\\(\\mathcal{ N }( 25, \\frac{ 25 }{ 3 } )\\). \\(\\mu\\) is an average skill
of player, and \\(\\sigma\\) is a confidence of the guessed rating. A real
skill of player is between \\(\\mu \\pm 2\\sigma\\) with 95% confidence.

::

   >>> from trueskill import Rating
   >>> Rating()  # use the default mu and sigma
   trueskill.Rating(mu=25.000, sigma=8.333)

If some player's rating is higher \\(\\beta\\) than another player's, the
player may have 80% of chance to beat the other player. The default value of
\\(\\beta\\) is \\(\\frac{ 25 }{ 6 }\\).

Ratings will approach real skills through few times of the TrueSkill's Bayesian
inference algorithm.

1:1 competition game
--------------------

Most competition games follows 1:1 match rule. If your game does, just use
``_1vs1`` helpers containing :func:`rate_1vs1` and :func:`quality_1vs1`. These
are very easy to use.

First of all, we need 2 :class:`Rating` objects:

::

    >>> r1 = Rating()  # 1P's skill
    >>> r2 = Rating()  # 2P's skill

Then we can guess match quality which is equivalent with draw probability of
this match using :func:`quality_1vs1`:

::

    >>> print '{:.1%} chance to draw'.format(quality_1vs1(r1, r2))
    44.7% chance to draw

After the game, TrueSkill recalculates their ratings by the game result. For
example, if 1P beat 2P:

::

    >>> new_r1, new_r2 = rate_1vs1(r1, r2)
    >>> print new_r1
    trueskill.Rating(mu=29.396, sigma=7.171)
    >>> print new_e2
    trueskill.Rating(mu=20.604, sigma=7.171)

Mu value follows player's win/draw/lose records. Higher value means higher game
skill. And sigma value follows the number of games. Lower value means many game
plays and higher rating confidence.

So 1P, a winner's skill grew up from 25 to 29.396 but 2P, a loser's skill shrank
to 20.604. And both sigma values became narrow about same magnitude.

Of course, you can also handle a tie game with ``drawn=True``:

::

    >>> new_r1, new_r2 = rate_1vs1(r1, r2, drawn=True)
    >>> print new_r1
    trueskill.Rating(mu=25.000, sigma=6.458)
    >>> print new_e2
    trueskill.Rating(mu=25.000, sigma=6.458)

Complex competition game
------------------------

There are many other match rules such as N:N team match, N:N:N multiple team
match, N:M unbalanced match, deathmatch (Player vs All), and so on. Mostly
other rating systems cannot work with them but TrueSkill does. TrueSkill
accepts any types of matches.

We should arrange ratings into a group by their team:

::

    >>> r1 = Rating()  # 1P's skill
    >>> r2 = Rating()  # 2P's skill
    >>> r3 = Rating()  # 3P's skill
    >>> t1 = [r1]  # Team A contains just 1P
    >>> t2 = [r2, r3]  # Team B contains 2P and 3P

Then we can calculate the match quality and rate them:

::

    >>> print '{:.1%} chance to draw'.format(quality([t1, t2]))
    13.5% chance to draw
    >>> (new_r1,), (new_r2, new_r3) = rate([t1, t2], ranks=[0, 1])
    >>> print new_r1
    trueskill.Rating(mu=33.731, sigma=7.317)
    >>> print new_r2
    trueskill.Rating(mu=16.269, sigma=7.317)
    >>> print new_r3
    trueskill.Rating(mu=16.269, sigma=7.317)

If you want to describe other game results, set the ``ranks`` argument like the
below examples:

- A drawn game -- ``ranks=[0, 0]``
- Team B won not team A -- ``ranks=[1, 0]`` (Lower rank is better)

Additionally, here are varied patterns of rating groups. All variables which
start with ``r`` are :class:`Rating` objects:

- N:N team match -- ``[(r1, r2, r3), (r4, r5, r6)]``
- N:N:N multiple team match -- ``[(r1, r2), (r3, r4), (r5, r6)]``
- N:M unbalanced match -- ``[(r1,), (r2, r3, r4)]``
- Deathmatch -- ``[(r1,), (r2,), (r3,), (r4,)]``

Partial play
------------

Let's assume that there are 2 teams which each has 2 players. The game was for
a hour but the one of players on the first team entered the game at 30 minutes
later.

If some player wasn't present for the entire duration of the game, use the
concept of "partial play" by ``weights`` parameter. The above situation can be
described by the following weights:

- 1P on team A -- 1 (Full time)
- 2P on team A -- 0.5 (30/60 minutes)
- 3P on team B -- 1
- 4P on team B -- 1

As a code with a 2-dimensional list:

::

    # set each weights to 1, 0.5, 1, 1
    rate([(r1, r2), (r3, r4)], weights=[(1, 0.5), (1, 1)])
    quality([(r1, r2), (r3, r4)], weights=[(1, 0.5), (1, 1)])

Or with a dictionary:

::

    # set a weight of 2nd player in 1st team to 0.5, otherwise leave as 1
    rate([(r1, r2), (r3, r4)], weights={(0, 1): 0.5})
    quality([(r1, r2), (r3, r4)], weights={(0, 1): 0.5})

API
~~~

TrueSkill objects
-----------------

.. autoclass:: Rating
   :members: exposure

.. autoclass:: TrueSkill
   :members: create_rating,
             rate,
             quality,
             rate_1vs1,
             quality_1vs1,
             make_as_global,

Proxy functions of the global environment
-----------------------------------------

.. autofunction:: setup

.. autofunction:: rate

.. autofunction:: quality

.. autofunction:: rate_1vs1

.. autofunction:: quality_1vs1

Constants
---------

.. autodata:: MU

.. autodata:: SIGMA

.. autodata:: BETA

.. autodata:: TAU

.. autodata:: DRAW_PROBABILITY

Changelog
~~~~~~~~~

.. include:: ../CHANGES

Further Reading
~~~~~~~~~~~~~~~

If you want to more details of the TrueSkill algorithm, see also:

- `TrueSkill™ Ranking System
  <http://research.microsoft.com/en-us/projects/trueskill>`_
  by Microsoft Research
- `TrueSkill Calcurator
  <http://atom.research.microsoft.com/trueskill/rankcalculator.aspx>`_
  by Microsoft Research
- `Computing Your Skill <http://bit.ly/moserware-trueskill>`_ by Jeff Moser
- `The Math Behind TrueSkill <http://bit.ly/trueskill-math>`_ by Jeff Moser

Licensing and Author
~~~~~~~~~~~~~~~~~~~~

This TrueSkill package is opened under the BSD_ license but the `TrueSkill™`_
brand is not. Microsoft permits only Xbox Live games or non-commercial projects
to use TrueSkill™. If your project is commercial, you should find another
rating system. See LICENSE_ for the details.

I'm `Heungsub Lee`_, a game developer. Any regarding questions or patches are
welcomed.

.. _BSD: http://en.wikipedia.org/wiki/BSD_licenses
.. _TrueSkill™: http://research.microsoft.com/en-us/projects/trueskill
.. _LICENSE: https://github.com/sublee/trueskill/blob/master/LICENSE
.. _Heungsub Lee: http://subl.ee/
