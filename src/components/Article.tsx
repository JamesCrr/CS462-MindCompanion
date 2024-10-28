import React from 'react';
import dayjs from 'dayjs';
import {TouchableWithoutFeedback} from 'react-native';

import Text from './Text';
import Block from './Block';
import Image from './Image';
import {useTheme, useTranslation} from '../hooks/';
import {IArticle, IEvent2} from '../constants/types';

const Article = ({
  title,
  // description,
  information,
  image,
  category,
  // rating,
  location,
  dateTime, 
  thingsToBring,
  meetUpLocations,
  participants,
  volunteers,
  timestamp,
  // user,

  onPress,
}: IEvent2) => {
  const {t} = useTranslation();
  const {colors, gradients, icons, sizes} = useTheme();

  image = "https://images.unsplash.com/photo-1604998103924-89e012e5265a?fit=crop&w=450&q=80";
  // render card for Newest & Fashion
  if (category?.id !== 1) {
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <Block card padding={sizes.sm} marginTop={sizes.sm}>
          <Image height={170} resizeMode="cover" source={{uri: image}} />
          {/* article category */}
          {category?.name && (
            <Text
              h5
              bold
              size={13}
              marginTop={sizes.s}
              transform="uppercase"
              marginLeft={sizes.xs}
              gradient={gradients.primary}>
              {category?.name}
            </Text>
          )}

          {/* article description */}
          <Text p semibold>
            {title}
          </Text>
          {information && (
            <Text
              p
              marginTop={sizes.s}
              marginLeft={sizes.xs}
              marginBottom={sizes.sm}>
              {information}
            </Text>
          )}

          {/* user details */}
          {/* {user?.name && (
            <Block row marginLeft={sizes.xs} marginBottom={sizes.xs}>
              <Image
                radius={sizes.s}
                width={sizes.xl}
                height={sizes.xl}
                source={{uri: user?.avatar}}
                style={{backgroundColor: colors.white}}
              />
              <Block justify="center" marginLeft={sizes.s}>
                <Text p semibold>
                  {user?.name}
                </Text>
                <Text p gray>
                  {t('common.posted', {
                    date: dayjs(timestamp).format('DD MMMM') || '-',
                  })}
                </Text>
              </Block>
            </Block>
          )} */}

          {/* location & rating */}
          {(Boolean(location) || Boolean(dateTime)) && (
            <Block row align="center">
              <Image source={icons.location} marginRight={sizes.s} />
              <Text p size={12} semibold>
                {/* {location?.city}, {location?.country} */}
                {location}
              </Text>
              <Text p bold marginHorizontal={sizes.s}>
                •
              </Text>
              <Image source={icons.star} marginRight={sizes.s} />
              <Text p size={12} semibold>
                {dateTime}
              </Text>
            </Block>
          )}
        </Block>
      </TouchableWithoutFeedback>
    );
  }

  // render card for Popular
  // return (
  //   <TouchableWithoutFeedback onPress={onPress}>
  //     <Block card white padding={0} marginTop={sizes.sm}>
  //       <Image
  //         background
  //         resizeMode="cover"
  //         radius={sizes.cardRadius}
  //         source={{uri: image}}>
  //         <Block color={colors.overlay} padding={sizes.padding}>
  //           <Text h4 white marginBottom={sizes.sm}>
  //             {title}
  //           </Text>
  //           <Text p white>
  //             {description}
  //           </Text>
  //           {/* user details */}
  //           <Block row marginTop={sizes.xxl}>
  //             <Image
  //               radius={sizes.s}
  //               width={sizes.xl}
  //               height={sizes.xl}
  //               source={{uri: user?.avatar}}
  //               style={{backgroundColor: colors.white}}
  //             />
  //             <Block justify="center" marginLeft={sizes.s}>
  //               <Text p white semibold>
  //                 {user?.name}
  //               </Text>
  //               <Text p white>
  //                 {user?.department}
  //               </Text>
  //             </Block>
  //           </Block>
  //         </Block>
  //       </Image>
  //     </Block>
  //   </TouchableWithoutFeedback>
  // );
};

export default Article;
