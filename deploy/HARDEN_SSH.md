# Durcir SSH sur le VPS (sans se couper l’accès)

Fais les étapes **dans l’ordre**. Saute une étape seulement si tu sais ce que tu fais.

## 1) Clé SSH depuis ton Mac

```bash
ssh-keygen -t ed25519 -C "kbio-vps" -f ~/.ssh/kbio_vps_ed25519
```

## 2) Installer la clé publique sur le serveur

Toujours connecté avec le mot de passe (une dernière fois) :

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```

Colle **une ligne** : le contenu de `~/.ssh/kbio_vps_ed25519.pub` depuis ton Mac.

```bash
chmod 600 ~/.ssh/authorized_keys
```

## 3) Tester une **nouvelle** connexion par clé (sans fermer la session actuelle)

Sur ton Mac, **nouveau terminal** :

```bash
ssh -i ~/.ssh/kbio_vps_ed25519 root@187.124.216.88
```

Si ça ouvre une session **sans demander le mot de passe**, tu peux continuer.  
Si ça échoue : corrige `authorized_keys` **avant** l’étape 4.

## 4) Appliquer le durcissement (drop-in sshd)

Sur le VPS (session qui marche) :

```bash
cd /var/www/gmao-suite/current
sudo cp deploy/sshd-hardening.conf.example /etc/ssh/sshd_config.d/99-gmao-hardening.conf
sudo sshd -t && sudo systemctl reload ssh
```

## 5) Connexion habituelle

```bash
ssh -i ~/.ssh/kbio_vps_ed25519 root@TON_IP
```

Tu peux ajouter un bloc `Host kbio-vps` dans `~/.ssh/config` sur le Mac pour éviter `-i` à chaque fois.

## En cas de problème

- **Console / rescue** Hostinger (VPS → terminal ou VNC) pour éditer `/etc/ssh/sshd_config.d/99-gmao-hardening.conf` ou le supprimer, puis `systemctl reload ssh`.

## Optionnel : utilisateur non-root + sudo

Créer un user `deploy`, lui donner sudo, mettre sa clé dans `/home/deploy/.ssh/authorized_keys`, puis dans le drop-in utiliser `PermitRootLogin no` — à faire seulement si tu maîtrises sudo et les permissions sur `/var/www`.
