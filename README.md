# botkit-storage-firebase

A Firebase storage module for Botkit.

## Usage

Just require `botkit-storage-firebase` and pass it a config with a `firebase_uri` option.
Then pass the returned storage when creating your Botkit controller. Botkit will do the rest.

Make sure everything you store has an `id` property, that's what you'll use to look it up later.

```
var Botkit = require('botkit'),
    firebaseStorage = require('botkit-storage-firebase')({firebase_uri: '...'}),
    controller = Botkit.slackbot({
        storage: firebaseStorage
    });
```

```
// then you can use the Botkit storage api, make sure you have an id property
var beans = {id: 'cool', beans: ['pinto', 'garbanzo']};
controller.storage.teams.save(beans);
beans = controller.storage.teams.get('cool');

```
