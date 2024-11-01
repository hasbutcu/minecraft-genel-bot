const { Client, GatewayIntentBits, Permissions, EmbedBuilder, PermissionsBitField, ActivityType   } = require('discord.js');
const ms = require('ms');
const config = require('./config.json');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});



// Bot hazır olduğunda
client.once('ready', () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
  client.user.setPresence({
    activities: [{ name: `Powered By hasDev ❤️`, type: ActivityType.Watching }],
    status: 'idle',
  });
});

// Mesaj geldiğinde
client.on('messageCreate', async message => {
  // Bot mesajlarını görmezden gel
  if (message.author.bot) return;

  // Selamlaşma sistemi
  const selamlar = ['sa', 'selamünaleyküm', 'merhaba'];
  if (selamlar.includes(message.content.toLowerCase())) {
    message.reply('Aleyküm Selam! Hoş geldin 👋');
    return;
  }

  // Prefix ile başlamayan mesajları görmezden gel
  if (!message.content.startsWith(config.prefix)) {
    // IP ve site komutları için özel kontrol
    if (message.content === '!ip') {
      message.reply('Sunucu IP: play.endernetwork.com.tr \nSunucu Sürüm: 1.16.5');
      return;
    }
    if (message.content === '!site') {
      message.reply('Web sitemiz: https://www.endernetwork.com.tr');
      return;
    }
    if (message.content === '!sürüm') {
        message.reply('1.16.5/1.18.2');
        return;
      }
    return;
  }

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();



  switch(command) {
    case 'ban':
      if (!message.member.permissions.has('BAN_MEMBERS')) {
        return message.reply('Bu komutu kullanma yetkiniz yok!');
      }
      const banUser = message.mentions.members.first();
      if (!banUser) {
        return message.reply('Lütfen banlanacak kullanıcıyı etiketleyin!');
      }
      try {
        await banUser.ban();
        message.reply(`${banUser.user.tag} sunucudan banlandı!`);
      } catch (error) {
        message.reply('Kullanıcı banlanamadı!');
      }
      break;

    case 'kick':
      if (!message.member.permissions.has('KICK_MEMBERS')) {
        return message.reply('Bu komutu kullanma yetkiniz yok!');
      }
      const kickUser = message.mentions.members.first();
      if (!kickUser) {
        return message.reply('Lütfen atılacak kullanıcıyı etiketleyin!');
      }
      try {
        await kickUser.kick();
        message.reply(`${kickUser.user.tag} sunucudan atıldı!`);
      } catch (error) {
        message.reply('Kullanıcı atılamadı!');
      }
      break;

      case 'mute':
        if (!message.member.permissions.has('MODERATE_MEMBERS')) {
          return message.reply('❌ Bu komutu kullanmak için yetkiniz bulunmuyor!');
        }
      
        const muteUser = message.mentions.members.first();
        if (!muteUser) {
          return message.reply('❌ Lütfen susturulacak kişiyi etiketleyin!\nÖrnek: ?mute @kullanıcı 1 saat Spam yaptı');
        }
      
        const timeArg = args[1];
        const timeUnit = args[2]?.toLowerCase();
        const reason = args.slice(3).join(' ') || 'Sebep belirtilmedi';
      
        if (!timeArg || !timeUnit) {
          return message.reply('❌ Lütfen geçerli bir süre belirtin!\nÖrnek: ?mute @kullanıcı 1 saat Spam yaptı');
        }
      
        let duration;
        switch (timeUnit) {
          case 'saniye':
          case 'sn':
            duration = timeArg * 1000;
            break;
          case 'dakika':
          case 'dk':
            duration = timeArg * 60000;
            break;
          case 'saat':
          case 'sa':
            duration = timeArg * 3600000;
            break;
          case 'gün':
          case 'gun':
            duration = timeArg * 86400000;
            break;
          default:
            return message.reply('❌ Geçerli bir zaman birimi kullanın! (saniye/sn, dakika/dk, saat/sa, gün/gun)');
        }
      
        // Maximum timeout süresi kontrolü (28 gün)
        if (duration > 2419200000) {
          return message.reply('❌ Discord maksimum 28 günlük timeout izin veriyor!');
        }
      
        try {
          await muteUser.timeout(duration, reason);
          
          // Embed oluştur
          const embed = new EmbedBuilder()
            .setColor('#FF4444')
            .setTitle('🔇 Kullanıcı Susturuldu')
            .addFields(
              { name: '👤 Kullanıcı', value: `${muteUser.user.tag}`, inline: true },
              { name: '⏱️ Süre', value: `${timeArg} ${timeUnit}`, inline: true },
              { name: '📝 Sebep', value: reason },
              { name: '🛠️ Yetkili', value: `${message.author.tag}`, inline: true }
            )
            .setTimestamp();
      
          message.reply({ embeds: [embed] });
      
          // Kullanıcıya DM gönder
          try {
            const userEmbed = new EmbedBuilder()
              .setColor('#FF4444')
              .setTitle(`🔇 ${message.guild.name} Sunucusunda Susturuldunuz`)
              .addFields(
                { name: '⏱️ Süre', value: `${timeArg} ${timeUnit}`, inline: true },
                { name: '📝 Sebep', value: reason }
              )
              .setTimestamp();
      
            await muteUser.send({ embeds: [userEmbed] });
          } catch (error) {
            console.log('Kullanıcıya DM gönderilemedi');
          }
      
        } catch (error) {
          console.error(error);
          message.reply('❌ Kullanıcı susturulamadı! Hata oluştu.');
        }
        break;
      
      // Yeni komut: Mute kaldırma
      case 'unmute':
        if (!message.member.permissions.has('MODERATE_MEMBERS')) {
          return message.reply('❌ Bu komutu kullanmak için yetkiniz bulunmuyor!');
        }
      
        const unmuteUser = message.mentions.members.first();
        if (!unmuteUser) {
          return message.reply('❌ Lütfen susturması kaldırılacak kişiyi etiketleyin!');
        }
      
        try {
          await unmuteUser.timeout(null);
          
          const unmuteEmbed = new EmbedBuilder()
            .setColor('#44FF44')
            .setTitle('🔊 Susturma Kaldırıldı')
            .addFields(
              { name: '👤 Kullanıcı', value: `${unmuteUser.user.tag}`, inline: true },
              { name: '🛠️ Yetkili', value: `${message.author.tag}`, inline: true }
            )
            .setTimestamp();
      
          message.reply({ embeds: [unmuteEmbed] });
        } catch (error) {
          message.reply('❌ Kullanıcının susturması kaldırılamadı!');
        }
        break;

    case 'sil':
      if (!message.member.permissions.has('MANAGE_MESSAGES')) {
        return message.reply('Bu komutu kullanma yetkiniz yok!');
      }
      const amount = parseInt(args[0]);
      if (isNaN(amount)) {
        return message.reply('Lütfen geçerli bir sayı girin!');
      }
      if (amount < 1 || amount > 100) {
        return message.reply('1 ile 100 arasında bir sayı girin!');
      }
      try {
        await message.channel.bulkDelete(amount + 1);
        message.channel.send(`${amount} mesaj silindi!`).then(msg => {
          setTimeout(() => msg.delete(), 3000);
        });
      } catch (error) {
        message.reply('Mesajlar silinemedi!');
      }
      break;

    case 'sahip':
      message.reply(`Bot sahibi: <@${config.sahipID}>`);
      break;

      case 'bakım':
  if (message.author.id !== config.sahipID) {
    return message.reply('❌ Bu komutu sadece bot sahibi kullanabilir!');
  }

  const bakimDurum = args[0]?.toLowerCase();
  
  if (!bakimDurum || !['aç', 'kapat'].includes(bakimDurum)) {
    return message.reply('❌ Lütfen geçerli bir parametre girin! (`?bakım aç <süre> <birim>` veya `?bakım kapat`)');
  }

  const bakimKanal = client.channels.cache.get(config.bakimKanalID);
  if (!bakimKanal) {
    return message.reply('❌ Bakım kanalı bulunamadı! Lütfen config.json dosyasını kontrol edin.');
  }

  if (bakimDurum === 'aç') {
    if (bakimModu) {
      return message.reply('❌ Bakım modu zaten açık!');
    }

    let sureMesaji = 'Bakım süresi boyunca bu kanaldan bilgilendirileceksiniz.';
    
    // Süre parametrelerini kontrol et
    const sure = args[1];
    const sureBirim = args[2]?.toLowerCase();
    
    if (sure && sureBirim) {
      if (!isNaN(sure)) {
        let birimText = '';
        switch(sureBirim) {
          case 'dakika':
          case 'dk':
            birimText = 'dakika';
            break;
          case 'saat':
          case 'sa':
            birimText = 'saat';
            break;
          case 'gün':
          case 'gun':
            birimText = 'gün';
            break;
          default:
            return message.reply('❌ Geçerli bir zaman birimi kullanın! (dakika/dk, saat/sa, gün/gun)');
        }
        sureMesaji = `Tahmini bakım süresi: ${sure} ${birimText}`;
      } else {
        return message.reply('❌ Geçerli bir süre giriniz!');
      }
    }

    bakimModu = true;

    const bakimBasladiEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🛠️ Bakım Modu Aktif')
      .setDescription('```diff\n- Minecraft sunucumuz şu anda bakımdadır!\n```')
      .addFields(
        { name: '📝 Bilgilendirme', value: 'Bakım süresince sunucuya giriş yapılamayacaktır.' },
        { name: '⏱️ Süre Bilgisi', value: sureMesaji }
      )
      .setTimestamp()
      .setFooter({ text: 'Anlayışınız için teşekkür ederiz.' });

    // Bakım kanalına mesaj gönder
    await bakimKanal.send({ embeds: [bakimBasladiEmbed] });

    // Durumu bildir
    const basladiEmbed = new EmbedBuilder()
      .setColor('#44FF44')
      .setTitle('✅ Bakım Modu Aktifleştirildi')
      .setDescription(`Bakım kanalına bilgilendirme mesajı gönderildi.\n${sureMesaji}`)
      .setTimestamp();

    message.reply({ embeds: [basladiEmbed] });

  } else if (bakimDurum === 'kapat') {
    if (!bakimModu) {
      return message.reply('❌ Bakım modu zaten kapalı!');
    }

    bakimModu = false;

    const bakimBittiEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Bakım Tamamlandı')
      .setDescription('```diff\n+ Minecraft sunucumuz tekrar aktif!\n```')
      .addFields(
        { name: '📝 Bilgilendirme', value: 'Sunucuya giriş yapabilirsiniz.' },
        { name: '🎮 Sunucu IP', value: 'play.endernetwork.com.tr' }
      )
      .setTimestamp()
      .setFooter({ text: 'İyi oyunlar dileriz!' });

    // Bakım kanalına mesaj gönder
    await bakimKanal.send({ embeds: [bakimBittiEmbed] });

    // Durumu bildir
    const bittiEmbed = new EmbedBuilder()
      .setColor('#44FF44')
      .setTitle('✅ Bakım Modu Kapatıldı')
      .setDescription('Bakım kanalına bilgilendirme mesajı gönderildi.')
      .setTimestamp();

    message.reply({ embeds: [bittiEmbed] });
  }
  break;
  // ... (önceki kodlar aynı)

  case 'bilgilendir':
    // Yetki kontrolü
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply('Bu işlemi gerçekleştirmek için yeterli izniniz yok.');
    }
  
    const targetUser = message.mentions.members.first();
    if (!targetUser) {
      return message.reply('❌ Lütfen bilgilendirilecek kişiyi etiketleyin!');
    }
  
    const derece = args[1];
    if (!derece || !['1', '2'].includes(derece)) {
      return message.reply('❌ Lütfen geçerli bir derece belirtin! (1 veya 2)');
    }
  
    try {
      if (derece === '1') {
        const derece1Embed = new EmbedBuilder()
          .setColor('#4287f5')
          .setTitle('🛡️ Yetkili Bilgilendirme - Derece 1')
          .setDescription('Aşağıda yetkileri ve görevleriniz detaylı olarak açıklanmıştır.')
          .addFields(
            { 
              name: '🔧 Kullanabileceğiniz Komutlar',
              value: `
  \`?mute <kullanıcı> <süre> <sebep>\` - Kullanıcıyı geçici olarak susturur
  \`!ip\` - Sunucu IP adresini gösterir
  \`!site\` - Sunucu web sitesini gösterir
  \`?sahip\` - Bot sahibini gösterir`
            },
            {
              name: '📝 Komut Kullanım Örnekleri',
              value: `
  \`?mute @kullanıcı 1 saat Spam\` - Kullanıcıyı 1 saat susturur
  \`?mute @kullanıcı 30 dakika Küfür\` - Kullanıcıyı 30 dakika susturur`
            },
            {
              name: '👥 Kullanıcılara Yaklaşım',
              value: `
  • Her zaman nazik ve saygılı olun
  • Kullanıcıların sorularını sabırla yanıtlayın
  • Emin olmadığınız konularda üst yetkililere danışın
  • Küfür ve hakaret içeren mesajlara asla aynı şekilde karşılık vermeyin`
            },
            {
              name: '🛠️ Bakım Durumunda',
              value: `
  • Kullanıcılara bakımın önemini anlatın
  • Tahmini bakım süresini bildirin
  • Sabırlı olmalarını rica edin
  • Bakım bitince bilgilendirme yapın`
            },
            {
              name: '⚠️ Önemli Hatırlatmalar',
              value: `
  • Yetkinizi asla kötüye kullanmayın
  • Her işleminizde adil olun
  • Kullanıcı şikayetlerini ciddiye alın
  • Sorun yaşadığınızda üst yetkililere danışın`
            }
          )
          .setTimestamp()
          .setFooter({ text: 'Görevinizde başarılar dileriz!' });
  
        await targetUser.send({ embeds: [derece1Embed] });
  
      } else if (derece === '2') {
        const derece2Embed = new EmbedBuilder()
          .setColor('#ff5733')
          .setTitle('🛡️ Yetkili Bilgilendirme - Derece 2')
          .setDescription('Aşağıda yetkileri ve görevleriniz detaylı olarak açıklanmıştır.')
          .addFields(
            {
              name: '🔧 Temel Komutlar',
              value: `
  \`?ban <kullanıcı> <sebep>\` - Kullanıcıyı sunucudan yasaklar
  \`?kick <kullanıcı> <sebep>\` - Kullanıcıyı sunucudan atar
  \`?sil <miktar>\` - Belirtilen sayıda mesaj siler`
            },
            {
              name: '📝 Komut Kullanım Örnekleri',
              value: `
  \`?ban @kullanıcı Kural ihlali\` - Kullanıcıyı yasaklar
  \`?kick @kullanıcı Uygunsuz davranış\` - Kullanıcıyı atar
  \`?sil 50\` - Son 50 mesajı siler`
            },
            {
              name: '👥 Ast Yetkililere Yaklaşım',
              value: `
  • Alt yetkililere karşı anlayışlı olun
  • Onlara rehberlik edin ve yardımcı olun
  • Hatalarını nazikçe düzeltin
  • Tecrübelerinizi paylaşın`
            },
            {
              name: '⚖️ Yetki Kullanımı',
              value: `
  • Ban/Kick komutlarını son çare olarak kullanın
  • Her işleminizi mutlaka kayıt altına alın
  • Toplu ceza işlemlerinde üst yetkililere danışın
  • Kararlarınızda adil ve tarafsız olun`
            },
            {
              name: '🎯 Ek Görevler',
              value: `
  • Alt yetkililerin performansını takip edin
  • Düzenli rapor tutun
  • Sunucu düzenini sağlayın
  • Yeni yetkililere mentorluk yapın`
            },
            {
              name: '⚠️ Önemli Hatırlatmalar',
              value: `
  • Derece 1 yetkililerin tüm sorumluluklarına sahipsiniz
  • Daha fazla yetki, daha fazla sorumluluk gerektirir
  • Her kararınızın sonuçlarını düşünün
  • Örnek davranışlar sergileyin`
            }
          )
          .setTimestamp()
          .setFooter({ text: 'Görevinizde başarılar dileriz!' });
  
        await targetUser.send({ embeds: [derece2Embed] });
      }
  
      // Bilgilendirme mesajı gönderen kişiye onay
      const onayEmbed = new EmbedBuilder()
        .setColor('#44FF44')
        .setTitle('✅ Bilgilendirme Gönderildi')
        .setDescription(`${targetUser.user.tag} kullanıcısına ${derece}. derece yetkili bilgilendirmesi gönderildi.`)
        .setTimestamp();
  
      message.reply({ embeds: [onayEmbed] });
  
    } catch (error) {
      console.error(error);
     message.reply('❌ Kullanıcıya özel mesaj gönderilemedi! DM\'i kapalı olabilir.');


    }
    break;
    
  }
});

// Botu başlat
client.login(config.token);