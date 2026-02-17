# CSS Candidates

## Problem
We have this problem that if we woudl have two federated modules

## Solution

We define CSS candidates as the HTML classes that are reserved solely for styling and are well known and defined reflecting the design system posibilities, configurations and values.

This MUST be defined inside a `@layer` always, see [layers](../layers.md) from more information and MUST be part of a [CSS generation system](../../architecture/distributed-css-managment.md)

SHOULD be prefxied for easy location by compilers, for instance with `_can_` as in `_can_some-candidate`.

